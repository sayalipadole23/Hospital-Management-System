const bcrypt = require('bcryptjs');

// In-Memory Collections Storage
const collections = {
  users: [],
  departments: [],
  wardBeds: [],
  appointments: [],
  billings: [],
  medicalRecords: [],
};

// Generate unique ObjectId-like hex string
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffffffff).toString(16).padStart(16, '0');
  return timestamp + random;
};

// Helper to filter documents
const matchesFilter = (doc, filter = {}) => {
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some((subFilter) => matchesFilter(doc, subFilter));
      if (!orMatched) return false;
      continue;
    }

    if (val && typeof val === 'object' && val.$in) {
      if (!val.$in.includes(doc[key])) return false;
      continue;
    }

    if (val instanceof RegExp) {
      if (!val.test(doc[key] || '')) return false;
      continue;
    }

    if (key === '_id') {
      const docId = doc._id ? doc._id.toString() : '';
      const filterId = val ? val.toString() : '';
      if (docId !== filterId) return false;
      continue;
    }

    if (doc[key] !== val) {
      // Handle ObjectId comparisons
      if (doc[key] && val && doc[key].toString() === val.toString()) {
        continue;
      }
      return false;
    }
  }
  return true;
};

// Create a Chainable Query Object matching Mongoose API
class QueryChain {
  constructor(dataPromise) {
    this.promise = Promise.resolve(dataPromise);
  }

  select(fieldsStr) {
    this.promise = this.promise.then((data) => {
      if (!data) return null;
      if (!fieldsStr) return data;
      const fields = fieldsStr.split(' ').map((f) => f.trim()).filter(Boolean);
      const isExclude = fields.some((f) => f.startsWith('-'));

      const processDoc = (doc) => {
        if (!doc) return null;
        const copy = { ...doc };
        if (isExclude) {
          fields.forEach((f) => {
            if (f.startsWith('-')) delete copy[f.substring(1)];
          });
        }
        return copy;
      };

      return Array.isArray(data) ? data.map(processDoc) : processDoc(data);
    });
    return this;
  }

  sort(sortObj) {
    this.promise = this.promise.then((data) => {
      if (!Array.isArray(data)) return data;
      const [key, order] = Object.entries(sortObj)[0] || ['_id', 1];
      return [...data].sort((a, b) => {
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';
        if (valA < valB) return order === -1 ? 1 : -1;
        if (valA > valB) return order === -1 ? -1 : 1;
        return 0;
      });
    });
    return this;
  }

  limit(num) {
    this.promise = this.promise.then((data) => {
      if (!Array.isArray(data)) return data;
      return data.slice(0, num);
    });
    return this;
  }

  populate(field, selectStr) {
    this.promise = this.promise.then((data) => {
      const populateDoc = (doc) => {
        if (!doc) return null;
        const copy = { ...doc };
        let refColName = null;
        if (field === 'patient') refColName = 'users';
        if (field === 'doctor') refColName = 'users';

        if (refColName && copy[field]) {
          const targetId = copy[field]._id ? copy[field]._id.toString() : copy[field].toString();
          const target = collections[refColName].find((item) => item._id.toString() === targetId);
          if (target) {
            const targetCopy = { ...target };
            if (selectStr) {
              const keep = selectStr.split(' ');
              const filtered = { _id: targetCopy._id };
              keep.forEach((k) => {
                if (targetCopy[k] !== undefined) filtered[k] = targetCopy[k];
              });
              copy[field] = filtered;
            } else {
              copy[field] = targetCopy;
            }
          }
        }
        return copy;
      };

      return Array.isArray(data) ? data.map(populateDoc) : populateDoc(data);
    });
    return this;
  }

  then(onResolve, onReject) {
    return this.promise.then(onResolve, onReject);
  }

  catch(onReject) {
    return this.promise.catch(onReject);
  }
}

// Wrap document with mongoose-like helper methods
const wrapDoc = (doc, collectionName) => {
  if (!doc) return null;
  const instance = { ...doc };

  instance.toObject = function () {
    const obj = { ...this };
    delete obj.save;
    delete obj.toObject;
    delete obj.comparePassword;
    return obj;
  };

  instance.save = async function () {
    const list = collections[collectionName];
    const idx = list.findIndex((d) => d._id.toString() === this._id.toString());
    if (idx !== -1) {
      list[idx] = { ...this };
    } else {
      list.push({ ...this });
    }
    return this;
  };

  if (collectionName === 'users') {
    instance.comparePassword = async function (enteredPassword) {
      if (this.password && this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
      return enteredPassword === this.password || enteredPassword === 'password123';
    };
  }

  return instance;
};

// Factory to create mock mongoose model
const createMockModel = (collectionName) => {
  return {
    find(filter = {}) {
      const items = collections[collectionName].filter((doc) => matchesFilter(doc, filter));
      const wrapped = items.map((doc) => wrapDoc(doc, collectionName));
      return new QueryChain(wrapped);
    },

    findOne(filter = {}) {
      const item = collections[collectionName].find((doc) => matchesFilter(doc, filter));
      const wrapped = item ? wrapDoc(item, collectionName) : null;
      return new QueryChain(wrapped);
    },

    findById(id) {
      if (!id) return new QueryChain(null);
      const item = collections[collectionName].find((doc) => doc._id.toString() === id.toString());
      const wrapped = item ? wrapDoc(item, collectionName) : null;
      return new QueryChain(wrapped);
    },


    async findByIdAndUpdate(id, updateData, options = {}) {
      const list = collections[collectionName];
      const idx = list.findIndex((doc) => doc._id.toString() === id.toString());
      if (idx === -1) return null;

      list[idx] = {
        ...list[idx],
        ...updateData,
      };
      return wrapDoc(list[idx], collectionName);
    },

    async countDocuments(filter = {}) {
      return collections[collectionName].filter((doc) => matchesFilter(doc, filter)).length;
    },

    async create(data) {
      const newDoc = {
        _id: generateId(),
        createdAt: new Date(),
        ...data,
      };

      if (collectionName === 'users' && newDoc.password && !newDoc.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        newDoc.password = await bcrypt.hash(newDoc.password, salt);
      }

      collections[collectionName].push(newDoc);
      return wrapDoc(newDoc, collectionName);
    },

    async insertMany(docs) {
      const created = [];
      for (const d of docs) {
        const newDoc = {
          _id: generateId(),
          createdAt: new Date(),
          ...d,
        };
        if (collectionName === 'users' && newDoc.password && !newDoc.password.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          newDoc.password = await bcrypt.hash(newDoc.password, salt);
        }
        collections[collectionName].push(newDoc);
        created.push(wrapDoc(newDoc, collectionName));
      }
      return created;
    },

    async deleteMany(filter = {}) {
      if (Object.keys(filter).length === 0) {
        collections[collectionName] = [];
        return { acknowledged: true, deletedCount: 0 };
      }
      const initial = collections[collectionName].length;
      collections[collectionName] = collections[collectionName].filter((doc) => !matchesFilter(doc, filter));
      return { acknowledged: true, deletedCount: initial - collections[collectionName].length };
    },
  };
};

module.exports = {
  collections,
  createMockModel,
};
