import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sanitizeObject } from '../../utils/sanitize';
import { validateLeaderRegister } from '../../utils/validate';
import { API_BASE_URL } from '../../config';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseApiError = (errorData) => {
  if (!errorData) return 'Failed to upload Excel';
  if (typeof errorData === 'string') return errorData;
  if (Array.isArray(errorData.errors)) {
    return {
      message: errorData.schemaValidationMessage || 'Upload validation failed',
      errors: errorData.errors,
    };
  }
  if (errorData.message) {
    return {
      message: errorData.message,
      errors: errorData.errors || [],
    };
  }
  return JSON.stringify(errorData);
};

// Async thunk for uploading Excel.
// Reports progress through the slice via `setUploadProgress` + `setUploadPhase`
// so the UI can show a real percentage bar while bytes are streaming, then an
// indeterminate "processing" state while the backend parses + persists the file.
export const uploadExcel = createAsyncThunk(
  'admin/uploadExcel',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadPhase('uploading'));
      dispatch(setUploadProgress(0));

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/admin/candidate/upload`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.min(100, Math.round((e.loaded * 100) / e.total));
          dispatch(setUploadProgress(pct));
          if (pct >= 100) dispatch(setUploadPhase('processing'));
        },
      });
      dispatch(setUploadPhase('done'));
      return response.data;
    } catch (error) {
      dispatch(setUploadPhase('idle'));
      return rejectWithValue(parseApiError(error.response?.data));
    }
  }
);

export const uploadAICatalogue = createAsyncThunk(
  'admin/uploadAICatalogue',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadPhase('uploading'));
      dispatch(setUploadProgress(0));

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/admin/ai-fluency/catalogue`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.min(100, Math.round((e.loaded * 100) / e.total));
          dispatch(setUploadProgress(pct));
          if (pct >= 100) dispatch(setUploadPhase('processing'));
        },
      });
      dispatch(setUploadPhase('done'));
      return response.data;
    } catch (error) {
      dispatch(setUploadPhase('idle'));
      return rejectWithValue(parseApiError(error.response?.data));
    }
  }
);

export const uploadAITracking = createAsyncThunk(
  'admin/uploadAITracking',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setUploadPhase('uploading'));
      dispatch(setUploadProgress(0));

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/admin/ai-fluency/tracking`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.min(100, Math.round((e.loaded * 100) / e.total));
          dispatch(setUploadProgress(pct));
          if (pct >= 100) dispatch(setUploadPhase('processing'));
        },
      });
      dispatch(setUploadPhase('done'));
      return response.data;
    } catch (error) {
      dispatch(setUploadPhase('idle'));
      return rejectWithValue(parseApiError(error.response?.data));
    }
  }
);

// Async thunk for getting all candidates with pagination
export const getAllCandidates = createAsyncThunk(
  'admin/getAllCandidates',
  async ({ page = 0, pageSize = undefined } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (pageSize) {
        params.append('pageSize', pageSize);
      }
      const response = await axios.get(`${API_BASE_URL}/admin/allcandidates?${params}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidates');
    }
  }
);

// Async thunk for deleting a candidate (admin only)
export const deleteCandidate = createAsyncThunk(
  'admin/deleteCandidate',
  async (associateId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/candidate/${associateId}`, {
        headers: getAuthHeaders(),
      });
      return { associateId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete candidate');
    }
  }
);

// Async thunk for registering a new Leader (admin only)
export const registerLeader = createAsyncThunk(
  'admin/registerLeader',
  async ({ email, password }, { rejectWithValue }) => {
    const { valid, errors } = validateLeaderRegister({ email, password });
    if (!valid) {
      return rejectWithValue(errors.join('; '));
    }
    const payload = { email: sanitizeObject(email), password };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/leaderRegister`,
        payload,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const message =
        typeof data === 'string'
          ? data
          : data?.message || 'Failed to register leader';
      return rejectWithValue(message);
    }
  }
);

// ── Leader management ─────────────────────────────────────────────────────────
export const getLeaders = createAsyncThunk(
  'admin/getLeaders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/leaders`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch leaders');
    }
  }
);

export const deleteLeader = createAsyncThunk(
  'admin/deleteLeader',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/leader/${userId}`, {
        headers: getAuthHeaders(),
      });
      return { userId, ...response.data };
    } catch (error) {
      const data = error.response?.data;
      const message = typeof data === 'string' ? data : data?.message || 'Failed to delete leader';
      return rejectWithValue(message);
    }
  }
);

// ── Ingestion Logs ────────────────────────────────────────────────────────────
export const getIngestionLogs = createAsyncThunk(
  'admin/getIngestionLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/ingestion-logs`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ingestion logs');
    }
  }
);

export const getIngestionLogDetails = createAsyncThunk(
  'admin/getIngestionLogDetails',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/ingestion-logs/${logId}`, {
        headers: getAuthHeaders(),
      });
      return response.data; // { log: {...}, errors: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ingestion log details');
    }
  }
);

export const getAICatalogue = createAsyncThunk(
  'admin/getAICatalogue',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    console.log('getAICatalogue token present:', Boolean(token));
    console.log('getAICatalogue token length:', token ? token.length : 0);
    if (!token) {
      console.warn('getAICatalogue: no token found in localStorage');
      return rejectWithValue('Authentication token missing. Please log in again.');
    }
    try {
      const headers = getAuthHeaders();
      console.log('getAICatalogue request headers:', headers);
      const response = await axios.get(`${API_BASE_URL}/admin/ai-fluency/catalogue`, {
        headers,
      });
      // API returns wrapper { success, message, data }, extract `data` (the array)
      return response.data?.data || [];
    } catch (error) {
      console.error('getAICatalogue error response:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data || 'Failed to fetch catalogue');
    }
  }
);

export const getAITracking = createAsyncThunk(
  'admin/getAITracking',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    console.log('getAITracking token present:', Boolean(token));
    console.log('getAITracking token length:', token ? token.length : 0);
    if (!token) {
      console.warn('getAITracking: no token found in localStorage');
      return rejectWithValue('Authentication token missing. Please log in again.');
    }
    try {
      const headers = getAuthHeaders();
      console.log('getAITracking request headers:', headers);
      const response = await axios.get(`${API_BASE_URL}/admin/ai-fluency/tracking`, {
        headers,
      });
      // API returns wrapper { success, message, data }, extract `data` (the array)
      return response.data?.data || [];
    } catch (error) {
      console.error('getAITracking error response:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data || 'Failed to fetch tracking');
    }
  }
);

// Async thunk for getting candidate by ID (admin)
export const getAssociateByIdAdmin = createAsyncThunk(
  'admin/getCandidateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/candidate?id=${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidate');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    candidates: [],
    uploadResult: null,
    currentCandidate: null,
    leaderRegistrationResult: null,
    leaderRegistrationError: null,
    leaderRegistrationLoading: false,
    leaders: [],
    leadersLoading: false,
    ingestionLogs: [],
    ingestionLogsLoading: false,
    ingestionLogDetails: null,
    ingestionLogDetailsLoading: false,
    catalogueList: [],
    catalogueLoading: false,
    trackingList: [],
    trackingLoading: false,
    uploadProgress: 0,                  // 0–100, only meaningful during 'uploading'
    uploadPhase: 'idle',                // 'idle' | 'uploading' | 'processing' | 'done'
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUploadResult: (state) => {
      state.uploadResult = null;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
    clearLeaderRegistration: (state) => {
      state.leaderRegistrationResult = null;
      state.leaderRegistrationError = null;
    },
    clearIngestionLogDetails: (state) => {
      state.ingestionLogDetails = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setUploadPhase: (state, action) => {
      state.uploadPhase = action.payload;
    },
    resetUpload: (state) => {
      state.uploadProgress = 0;
      state.uploadPhase = 'idle';
      state.uploadResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadResult = null;
      })
      .addCase(uploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResult = action.payload;
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAICatalogue.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadResult = null;
      })
      .addCase(uploadAICatalogue.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResult = action.payload;
      })
      .addCase(uploadAICatalogue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAITracking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadResult = null;
      })
      .addCase(uploadAITracking.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResult = action.payload;
      })
      .addCase(uploadAITracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.content || action.payload;
        if (action.payload.currentPage !== undefined) {
          state.pagination = {
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
            isLast: action.payload.isLast,
          };
        }
      })
      .addCase(getAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAssociateByIdAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssociateByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getAssociateByIdAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerLeader.pending, (state) => {
        state.leaderRegistrationLoading = true;
        state.leaderRegistrationError = null;
        state.leaderRegistrationResult = null;
      })
      .addCase(registerLeader.fulfilled, (state, action) => {
        state.leaderRegistrationLoading = false;
        state.leaderRegistrationResult = action.payload;
        // Optimistically prepend the new leader to the list so the table shows it immediately
        if (action.payload && action.payload.userId) {
          state.leaders = [action.payload, ...state.leaders];
        }
      })
      .addCase(registerLeader.rejected, (state, action) => {
        state.leaderRegistrationLoading = false;
        state.leaderRegistrationError = action.payload;
      })
      .addCase(deleteCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = state.candidates.filter(
          (c) => c.associateId !== action.payload.associateId
        );
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIngestionLogs.pending, (state) => {
        state.ingestionLogsLoading = true;
      })
      .addCase(getIngestionLogs.fulfilled, (state, action) => {
        state.ingestionLogsLoading = false;
        state.ingestionLogs = action.payload || [];
      })
      .addCase(getIngestionLogs.rejected, (state) => {
        state.ingestionLogsLoading = false;
      })
      .addCase(getIngestionLogDetails.pending, (state) => {
        state.ingestionLogDetailsLoading = true;
        state.ingestionLogDetails = null;
      })
      .addCase(getIngestionLogDetails.fulfilled, (state, action) => {
        state.ingestionLogDetailsLoading = false;
        state.ingestionLogDetails = action.payload;
      })
      .addCase(getIngestionLogDetails.rejected, (state) => {
        state.ingestionLogDetailsLoading = false;
      })
      .addCase(getAICatalogue.pending, (state) => {
        state.catalogueLoading = true;
      })
      .addCase(getAICatalogue.fulfilled, (state, action) => {
        state.catalogueLoading = false;
        state.catalogueList = action.payload || [];
      })
      .addCase(getAICatalogue.rejected, (state) => {
        state.catalogueLoading = false;
      })
      .addCase(getAITracking.pending, (state) => {
        state.trackingLoading = true;
      })
      .addCase(getAITracking.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.trackingList = action.payload || [];
      })
      .addCase(getAITracking.rejected, (state) => {
        state.trackingLoading = false;
      })
      .addCase(getLeaders.pending, (state) => {
        state.leadersLoading = true;
      })
      .addCase(getLeaders.fulfilled, (state, action) => {
        state.leadersLoading = false;
        state.leaders = action.payload || [];
      })
      .addCase(getLeaders.rejected, (state) => {
        state.leadersLoading = false;
      })
      .addCase(deleteLeader.fulfilled, (state, action) => {
        state.leaders = state.leaders.filter((l) => l.userId !== action.payload.userId);
      });
  },
});

export const {
  clearError,
  clearUploadResult,
  clearCurrentCandidate,
  clearLeaderRegistration,
  clearIngestionLogDetails,
  setUploadProgress,
  setUploadPhase,
  resetUpload,
} = adminSlice.actions;
export default adminSlice.reducer;