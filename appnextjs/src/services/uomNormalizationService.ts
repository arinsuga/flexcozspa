import { appApi } from './api';

export interface UomNormalization {
  id: number;
  raw_uom_code: string;
  uom_code: string;
  language: 'en' | 'id' | 'mixed';
  is_indonesian_specific: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UomNormalizationServiceType {
  getAll(): Promise<UomNormalization[]>;
  getById(id: number): Promise<UomNormalization>;
  create(data: Partial<UomNormalization>): Promise<UomNormalization>;
  update(id: number, data: Partial<UomNormalization>): Promise<UomNormalization>;
  delete(id: number): Promise<void>;
}

const uomNormalizationService: UomNormalizationServiceType = {
  async getAll(): Promise<UomNormalization[]> {
    const response = await appApi.get('/uom-normalizations');
    return response.data;
  },

  async getById(id: number): Promise<UomNormalization> {
    const response = await appApi.get(`/uom-normalizations/${id}`);
    return response.data;
  },

  async create(data: Partial<UomNormalization>): Promise<UomNormalization> {
    const response = await appApi.post('/uom-normalizations', data);
    return response.data;
  },

  async update(id: number, data: Partial<UomNormalization>): Promise<UomNormalization> {
    const response = await appApi.put(`/uom-normalizations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await appApi.delete(`/uom-normalizations/${id}`);
  },
};

export default uomNormalizationService;
