export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      next(err); // Central errorHandler already knows how to format Zod errors!
    }
  };
}

export default validate;
