export const authorizePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = JSON.parse(req.user.permissions || '[]');
    const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));
    
    if (!hasPermission && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
    }
    next();
  };
};

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role.' });
    }
    next();
  };
};
