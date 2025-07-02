import type { Relation, Step } from "../features/recipeSlice";

export const hasCycle = (steps: Step[], rels: Relation[], parentId: string, childId: string) => {
  const adj: { [key: string]: string[] } = {};
  steps.forEach(step => adj[step.id] = []);
  rels.forEach(rel => adj[rel.parentId].push(rel.childId));

  const dfs = (currentId: string, targetId: string, visited = new Set()) => {
    if (currentId === targetId) {
      return true;
    }

    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);

    for (const neighbour of adj[currentId]) {
      if (dfs(neighbour, targetId, visited)) {
        return true;
      }
    }

    return false;
  }

  return dfs(childId, parentId);
}

export const isDescendant = (steps: Step[], rels: Relation[], parentId: string, childId: string) => {
  const adj: { [key: string]: string[] } = {};
  steps.forEach(step => adj[step.id] = []);
  rels.forEach(rel => adj[rel.parentId].push(rel.childId));

  const visited = new Set();
  const dfs = (current: string) => {
    if (visited.has(current)) {
      return;
    }

    visited.add(current);
    adj[current].forEach(childId => dfs(childId));
  }

  dfs(parentId);

  return visited.has(childId);
}