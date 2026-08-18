export const departmentAccess = {
  Admin: {
    departments: "ALL",
  },
  HR: {
    departments: ["HR", "D001"],
  },
  Manager: {
    departments: ["ASSIGNED"],
  },
  "Team Lead": {
    departments: ["TEAM_ONLY"],
  },
  Employee: {
    departments: ["SELF_ONLY"],
  },
};
