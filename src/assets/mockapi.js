import { nodes1, nodes0 } from "./nodes";
export function selectCropRelationData(data) {
  if (data.relationClsGrp) {
    return Promise.resolve({ data: nodes1 });
  }
  return Promise.resolve({ data: nodes0 });
}
