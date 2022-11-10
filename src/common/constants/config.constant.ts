export const configConstant = {
  database: {
    host: 'DATABASE_HOST',
    port: 'DATABASE_PORT',
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    name: 'DATABASE_NAME',
  },
    jwt:{
    subSecret:"JWT_SUBSCRIPTION_SECRET"
  },
  baseUrls: {
    identityService: 'IDENTITY_SERVICE_URL',
    notificationService: 'NOTIFICATION_SERVICE_URL',
    coreService: 'CORE_SERVICE_URL',
    identityFEUrl: 'IDENTITY_SERVICE_FE_URL',
    completeSignupFE: 'IDENTITY_FE_COMPLETE_SIGNUP'
  },

};
