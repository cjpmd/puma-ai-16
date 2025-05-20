
// A simple adapter to map string roles to the enum type expected by the UserAssignmentDialog
export type AllowedUserRoles = "admin" | "manager" | "coach" | "parent" | "globalAdmin";

export const mapStringToUserRole = (role: string): AllowedUserRoles => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'coach':
      return 'coach';
    case 'parent':
      return 'parent';
    case 'globaladmin':
      return 'globalAdmin';
    default:
      return 'coach'; // Default role
  }
};
