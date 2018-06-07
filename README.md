Very simple `mongoose plugin` for `auto populate` all the model reference fields deep.
Support 1 subref level.

Usage
-----

Just
```bash
const mongoosePopulateDeep = require('mongoose-auto-populate-deep')
```
and
```$xslt
MongooseSchema.plugin(mongoosePopulateDeep, { exclude: [] });
```

`exclude` optional parameter. Excluded fields array. Provided fields won't be populated
