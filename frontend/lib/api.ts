import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ProjectInput {
  project_name: string;
  target_capacity_adt: number;
  tier: 'Basic' | 'Essential' | 'Full-Fledged';
  contamination: {
    metals: number;
    plastics: number;
    stickies: number;
    ash: number;
  };
}

export interface SchemeResult {
  project_id: string;
  scheme_id: string;
  result: {
    equipment_list: any[];
    pfd_topology: {
      nodes: any[];
      edges: any[];
    };
  };
}

export const generateScheme = async (inputData: ProjectInput): Promise<SchemeResult> => {
  const response = await axios.post(`${API_BASE_URL}/projects/generate`, inputDataData);
  return response.data;
};
