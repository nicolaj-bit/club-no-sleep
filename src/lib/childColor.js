// Fast, deterministic colour per child — the same colour everywhere in the app.
// Assigned by the child's position in the sorted children list (Child.order),
// so siblings always get distinct colours without needing a stored colour field.
const CHILD_COLORS = [
  '#C29A73',
  '#8B5E3C',
  '#A0785A',
  '#6B4E2A',
  '#B08D72',
  '#7A5C3A',
  '#9A7B5A',
  '#5C3D1E',
];

export function getChildColor(children, childId) {
  if (!children || !childId) return '#B7A79A';
  const idx = children.findIndex((c) => c.id === childId);
  if (idx === -1) return '#B7A79A';
  return CHILD_COLORS[idx % CHILD_COLORS.length];
}