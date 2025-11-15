type ErrorMessage = {
    status: number;
    message: string;
  };
  
  const success = 200;
  const created = 201;
  const noContent = 204;
  const badRequest = 400;
  const unauthorized = 401;
  const notFound = 404;
  const invalidToken = 403;
  const conflict = 409;
  const unprocessableEntity = 422;
  const internalServerError = 500;
  
  const userNotFound: ErrorMessage = { status: notFound, message: 'Parceiro não encontrado' };
  const loginUserNotFound: ErrorMessage = { status: unauthorized, message: 'Usuário incorreto' };
  const passwordUserNotMatch: ErrorMessage = { status: unauthorized, message: 'Senha Incorreta' };
  const errorConflict: ErrorMessage = { status: conflict, message: 'Número ou Nome já está cadastrado em nossa base de dados' };
  
  export {
    success,
    created,
    noContent,
    badRequest,
    unauthorized,
    notFound,
    invalidToken,
    conflict,
    unprocessableEntity as Unprocessa,
    internalServerError,
    userNotFound,
    loginUserNotFound,
    passwordUserNotMatch,
    errorConflict,
  };
  