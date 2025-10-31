import { builder } from '../builder';

// Authentication mutations are disabled for local-only mode
builder.mutationFields((t) => ({
  // Placeholder mutations that return errors when called
  loginWithEmail: t.fieldWithInput({
    type: 'Boolean',
    input: {
      email: t.input.string(),
      password: t.input.string(),
    },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  sendSignUpEmail: t.fieldWithInput({
    type: 'Boolean',
    input: {
      email: t.input.string(),
      password: t.input.string(),
      name: t.input.string(),
      state: t.input.string(),
      marketingAgreed: t.input.boolean(),
      referralCode: t.input.string({ required: false }),
    },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  authorizeSignUpEmail: t.fieldWithInput({
    type: 'String',
    input: { code: t.input.string() },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  generateSingleSignOnAuthorizationUrl: t.fieldWithInput({
    type: 'String',
    input: {
      provider: t.input.field({ type: 'SingleSignOnProvider' }),
      email: t.input.string({ required: false }),
      state: t.input.string(),
    },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  authorizeSingleSignOn: t.fieldWithInput({
    type: 'String',
    input: {
      provider: t.input.field({ type: 'SingleSignOnProvider' }),
      params: t.input.field({ type: 'JSON' }),
      referralCode: t.input.string({ required: false }),
    },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  sendPasswordResetEmail: t.fieldWithInput({
    type: 'Boolean',
    input: { email: t.input.string() },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),

  resetPassword: t.fieldWithInput({
    type: 'Boolean',
    input: { code: t.input.string(), password: t.input.string() },
    resolve: () => {
      throw new Error('Authentication disabled for local-only mode');
    },
  }),
}));