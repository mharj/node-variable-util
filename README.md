# node-variable-util

## Note: this is no longer maintained, @avanio/variable-util replaced this module.

Utility to get variables for NodeJS from multiple resources

Async check variable from

- ENV (and .env via dotenv)
- docker secrets (option to force filename lowercase)
- settings.json file (easy to patch with i.e. Azure DevOps File Transform task)

Good way to utilize settings.json is to create all variables to this json file, fill null as value and add this "empty" one to git.

```typescript
await getConfigVariable('SETTINGS_VARIABLE', 'default_value');
```

TODO: current lookup order still hardcoded ['dockersecret', 'env', 'settingsfile'], later should be able to control this.
