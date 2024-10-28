import { v4 as uuidv4 } from "uuid";

export const generateId = () => uuidv4();
export const parseJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
