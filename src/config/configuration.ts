export default () => ({
    port: process.env.PORT,
    secretJwt: process.env.SECRET_JWT,
    env: process.env.ENVIRONMENT,
});
