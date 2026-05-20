import type { FastifyReply, FastifyRequest } from "fastify";

export type AuthRole = "DOCTOR" | "PATIENT" | "CLINIC";

type ControllerHandler = (
  req: FastifyRequest,
  res: FastifyReply,
) => unknown | Promise<unknown>;

export function Auth(...allowedRoles: AuthRole[]): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as ControllerHandler | undefined;

    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = async function (
      req: FastifyRequest,
      res: FastifyReply,
    ) {
      if (!req.session.userId || !req.session.role) {
        return res.status(401).send({
          message: "Authentication required",
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.session.role)) {
        return res.status(403).send({
          message: "Insufficient permissions",
        });
      }

      return originalMethod.call(this, req, res);
    };

    return descriptor;
  };
}
