'use strict';

const getChildPath = modelName =>
  getRoutes(require('mongoose').model(modelName).schema.paths).map(getRef(false));

const getRef = needPopulate => ({ pathname, ref }) =>
  ref && { path: pathname, populate: needPopulate && getChildPath(ref) };

const normalizePaths = ob => !ob.schemaType.options.type[0].type ? ob.schemaType.options.type[0] : {
  [ob.pathname]: Object.assign({}, ob.schemaType.options.type[0], { pathname: ob.pathname }),
};

const getPathWithNested = (ob, paths) => Object.keys(paths)
  .filter(key => paths[key].ref)
  .map(key => ({
    pathname: paths[key].pathname ? paths[key].pathname : `${ob.pathname}.${key}`,
    ref: paths[key].ref
  }));

const getPath = ob => [{
  pathname: ob.pathname,
  ref: ob.schemaType.options.ref
}];

const getRoutes = paths => Object.keys(paths)
  .filter(key => paths[key].options && (paths[key].options.type instanceof Array || paths[key].options.ref))
  .map(key => ({ pathname: key, schemaType: paths[key] }))
  .reduce((res, ob) => [].concat(res, ob.schemaType.options.type instanceof Array ?
    getPathWithNested(ob, normalizePaths(ob)) :
    getPath(ob)
  ), []);
const preparePathes = pathes => ({ exclude = [] }) =>
  Object.keys(pathes)
    .filter(path => !exclude.includes(path))
    .reduce((r, path) => Object.assign(r, { [path]: pathes[path] }), {})
const getSchemaPath = (Schema, options) => getRoutes(preparePathes(Schema.paths)(options)).map(getRef(true));

const populateHandler = populateAll => function (next) {
  if (this._mongooseOptions && this._mongooseOptions.lean) {
    next();
  } else {
    this.populate(populateAll);
    next();
  }

};

module.exports = (Schema, options = {}) => {
  const populateAll = getSchemaPath(Schema, options);
  Schema.pre('findOne', populateHandler(populateAll));
};
