import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Types
export interface Summary {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  originalText: string;
  summary: string;
  wordCount: {
    original: number;
    summary: number;
  };
  prompt: string;
  aiProvider: 'openai' | 'gemini';
  model: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  processingTime: number;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
  compressionRatio?: string;
}

export interface AIInfo {
  provider: string;
  model: string;
  processingTime: number;
  usage?: any;
}

export interface FileInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  extension: string;
  wordCount: number;
  characterCount: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SummaryState {
  summaries: Summary[];
  currentSummary: Summary | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  aiModels: {
    openai: Array<{ id: string; name: string; maxTokens: number }>;
    gemini: Array<{ id: string; name: string; maxTokens: number }>;
  } | null;
  supportedFileTypes: Array<{
    extension: string;
    mimeType: string;
    name: string;
    maxSize: string;
  }> | null;
  aiConfiguration: {
    openai: { configured: boolean; baseUrl: string };
    gemini: { configured: boolean; baseUrl: string };
  } | null;
}

// Async thunks
export const fetchSummaries = createAsyncThunk(
  'summary/fetchSummaries',
  async (params: { page?: number; limit?: number; search?: string } = {}, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const response = await axios.get(`${API_BASE_URL}/summaries?${queryParams}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch summaries');
    }
  }
);

export const fetchSummaryById = createAsyncThunk(
  'summary/fetchSummaryById',
  async (summaryId: string, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const response = await axios.get(`${API_BASE_URL}/summaries/${summaryId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch summary');
    }
  }
);

export const createSummaryFromText = createAsyncThunk(
  'summary/createSummaryFromText',
  async (data: {
    text: string;
    prompt?: string;
    provider?: 'openai' | 'gemini';
    model?: string;
  }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const response = await axios.post(`${API_BASE_URL}/summaries`, data, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Refresh summaries list after creating new summary
      dispatch(fetchSummaries({}));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create summary');
    }
  }
);

export const createSummaryFromFile = createAsyncThunk(
  'summary/createSummaryFromFile',
  async (data: {
    file: File;
    prompt?: string;
    provider?: 'openai' | 'gemini';
    model?: string;
  }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const formData = new FormData();
      formData.append('file', data.file);
      if (data.prompt) formData.append('prompt', data.prompt);
      if (data.provider) formData.append('provider', data.provider);
      if (data.model) formData.append('model', data.model);

      const response = await axios.post(`${API_BASE_URL}/summaries/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh summaries list after creating new summary
      dispatch(fetchSummaries({}));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create summary from file');
    }
  }
);

export const updateSummary = createAsyncThunk(
  'summary/updateSummary',
  async (data: {
    summaryId: string;
    prompt?: string;
    provider?: 'openai' | 'gemini';
    model?: string;
  }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const response = await axios.put(`${API_BASE_URL}/summaries/${data.summaryId}`, {
        prompt: data.prompt,
        provider: data.provider,
        model: data.model
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Refresh summaries list after updating
      dispatch(fetchSummaries({}));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update summary');
    }
  }
);

export const deleteSummary = createAsyncThunk(
  'summary/deleteSummary',
  async (summaryId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      await axios.delete(`${API_BASE_URL}/summaries/${summaryId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Refresh summaries list after deleting
      dispatch(fetchSummaries({}));

      return summaryId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete summary');
    }
  }
);

export const fetchAIModels = createAsyncThunk(
  'summary/fetchAIModels',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const response = await axios.get(`${API_BASE_URL}/summaries/ai/models`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch AI models');
    }
  }
);

export const fetchFileTypes = createAsyncThunk(
  'summary/fetchFileTypes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        throw new Error('No token available');
      }

      const response = await axios.get(`${API_BASE_URL}/summaries/file/types`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch file types');
    }
  }
);

// Initial state
const initialState: SummaryState = {
  summaries: [],
  currentSummary: null,
  loading: false,
  error: null,
  pagination: null,
  aiModels: null,
  supportedFileTypes: null,
  aiConfiguration: null,
};

// Summary slice
const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSummary: (state, action: PayloadAction<Summary | null>) => {
      state.currentSummary = action.payload;
    },
    clearCurrentSummary: (state) => {
      state.currentSummary = null;
    },
    updateSummaryInList: (state, action: PayloadAction<Summary>) => {
      const index = state.summaries.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.summaries[index] = action.payload;
      }
    },
    removeSummaryFromList: (state, action: PayloadAction<string>) => {
      state.summaries = state.summaries.filter(s => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch summaries
    builder
      .addCase(fetchSummaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        state.loading = false;
        state.summaries = action.payload.summaries;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch summary by ID
    builder
      .addCase(fetchSummaryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummaryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSummary = action.payload.summary;
      })
      .addCase(fetchSummaryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create summary from text
    builder
      .addCase(createSummaryFromText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSummaryFromText.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSummary = action.payload.summary;
      })
      .addCase(createSummaryFromText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create summary from file
    builder
      .addCase(createSummaryFromFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSummaryFromFile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSummary = action.payload.summary;
      })
      .addCase(createSummaryFromFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update summary
    builder
      .addCase(updateSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSummary = action.payload.summary;
      })
      .addCase(updateSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete summary
    builder
      .addCase(deleteSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSummary.fulfilled, (state) => {
        state.loading = false;
        state.currentSummary = null;
      })
      .addCase(deleteSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch AI models
    builder
      .addCase(fetchAIModels.fulfilled, (state, action) => {
        state.aiModels = action.payload.models;
        state.aiConfiguration = action.payload.configuration;
      });

    // Fetch file types
    builder
      .addCase(fetchFileTypes.fulfilled, (state, action) => {
        state.supportedFileTypes = action.payload.supportedTypes;
      });
  },
});

export const { 
  clearError, 
  setCurrentSummary, 
  clearCurrentSummary, 
  updateSummaryInList, 
  removeSummaryFromList 
} = summarySlice.actions;

export default summarySlice.reducer; 