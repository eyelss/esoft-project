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

/**
 * Checks if a connection can be safely deleted
 * A connection can be deleted if:
 * 1. It's not the only connection to the root step
 * 2. Deleting it won't create disconnected components
 * 3. The child step has other parents or is not the root step
 * 4. Deleting it won't create isolated nodes (nodes with no parents and no children)
 */
export const canDeleteConnection = (
  steps: Step[], 
  relations: { [id: string]: Relation }, 
  relationId: string, 
  rootStepId: string
): boolean => {
  const relation = relations[relationId];
  if (!relation) return false;

  const { parentId, childId } = relation;
  const relsArray = Object.values(relations);

  // Cannot delete if this is the only connection to the root step
  if (childId === rootStepId) {
    const connectionsToRoot = relsArray.filter(rel => rel.childId === rootStepId);
    if (connectionsToRoot.length <= 1) {
      return false;
    }
  }

  // Check if child has other parents besides this one
  const childParents = relsArray.filter(rel => rel.childId === childId && rel !== relation);
  if (childParents.length > 0) {
    return true; // Child has other parents, safe to delete
  }

  // Check if child would become isolated (no parents and no children)
  const childChildren = relsArray.filter(rel => rel.parentId === childId);
  if (childChildren.length === 0) {
    // This would create an isolated node (no parents, no children)
    return false;
  }

  // If child has children but no other parents, check if deleting would create disconnected components
  // This is a more complex check - we need to ensure the graph remains connected
  const tempRels = relsArray.filter(rel => rel !== relation);
  
  // Check if the child's descendants can still be reached from the root
  const canReachFromRoot = (stepId: string, visited = new Set<string>()): boolean => {
    if (stepId === rootStepId) return true;
    if (visited.has(stepId)) return false;
    
    visited.add(stepId);
    const parents = tempRels.filter(rel => rel.childId === stepId);
    
    for (const parent of parents) {
      if (canReachFromRoot(parent.parentId, visited)) {
        return true;
      }
    }
    
    return false;
  };

  // Check if all descendants of the child can still be reached
  const childDescendants = getDescendants(steps, tempRels, childId);
  for (const descendant of childDescendants) {
    if (!canReachFromRoot(descendant.id)) {
      return false; // Would create disconnected component
    }
  }

  return true;
};

/**
 * Gets all descendants of a step (including the step itself)
 */
export const getDescendants = (steps: Step[], rels: Relation[], stepId: string): Step[] => {
  const adj: { [key: string]: string[] } = {};
  steps.forEach(step => adj[step.id] = []);
  rels.forEach(rel => adj[rel.parentId].push(rel.childId));

  const descendants: Step[] = [];
  const visited = new Set<string>();

  const dfs = (currentId: string) => {
    if (visited.has(currentId)) return;
    
    visited.add(currentId);
    const step = steps.find(s => s.id === currentId);
    if (step) descendants.push(step);
    
    adj[currentId].forEach(childId => dfs(childId));
  };

  dfs(stepId);
  return descendants;
};

/**
 * Gets all connections that can be deleted for a given step
 */
export const getDeletableConnections = (
  steps: Step[], 
  relations: { [id: string]: Relation }, 
  stepId: string, 
  rootStepId: string
): string[] => {
  const deletableConnections: string[] = [];
  const relsArray = Object.values(relations);
  
  // Check parent connections
  const parentConnections = relsArray.filter(rel => rel.childId === stepId);
  for (const rel of parentConnections) {
    const relationId = Object.keys(relations).find(id => relations[id] === rel);
    if (relationId && canDeleteConnection(steps, relations, relationId, rootStepId)) {
      deletableConnections.push(relationId);
    }
  }
  
  // Check child connections
  const childConnections = relsArray.filter(rel => rel.parentId === stepId);
  for (const rel of childConnections) {
    const relationId = Object.keys(relations).find(id => relations[id] === rel);
    if (relationId && canDeleteConnection(steps, relations, relationId, rootStepId)) {
      deletableConnections.push(relationId);
    }
  }
  
  return deletableConnections;
};