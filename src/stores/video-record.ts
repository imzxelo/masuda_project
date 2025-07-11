import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { VideoRecord, VideoRecordInput } from '@/types/video-record'

interface VideoRecordState {
  selectedVideoRecord: VideoRecord | null
  videoRecords: VideoRecord[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setSelectedVideoRecord: (videoRecord: VideoRecord | null) => void
  setVideoRecords: (videoRecords: VideoRecord[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  addVideoRecord: (videoRecord: VideoRecord) => void
  updateVideoRecord: (id: string, updates: Partial<VideoRecord>) => void
  removeVideoRecord: (id: string) => void
  clearVideoRecords: () => void
  getVideoRecordById: (id: string) => VideoRecord | null
  getVideoRecordsByStudent: (studentId: string) => VideoRecord[]
}

export const useVideoRecordStore = create<VideoRecordState>()(
  persist(
    (set, get) => ({
      selectedVideoRecord: null,
      videoRecords: [],
      isLoading: false,
      error: null,

      setSelectedVideoRecord: (videoRecord) =>
        set({ selectedVideoRecord: videoRecord }),

      setVideoRecords: (videoRecords) =>
        set({ videoRecords }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      addVideoRecord: (videoRecord) =>
        set((state) => ({
          videoRecords: [...state.videoRecords, videoRecord]
        })),

      updateVideoRecord: (id, updates) =>
        set((state) => ({
          videoRecords: state.videoRecords.map((record) =>
            record.id === id ? { ...record, ...updates } : record
          ),
          selectedVideoRecord: state.selectedVideoRecord?.id === id
            ? { ...state.selectedVideoRecord, ...updates }
            : state.selectedVideoRecord
        })),

      removeVideoRecord: (id) =>
        set((state) => ({
          videoRecords: state.videoRecords.filter((record) => record.id !== id),
          selectedVideoRecord: state.selectedVideoRecord?.id === id
            ? null
            : state.selectedVideoRecord
        })),

      clearVideoRecords: () =>
        set({ videoRecords: [], selectedVideoRecord: null }),

      getVideoRecordById: (id) => {
        const state = get()
        return state.videoRecords.find((record) => record.id === id) || null
      },

      getVideoRecordsByStudent: (studentId) => {
        const state = get()
        return state.videoRecords.filter((record) => record.studentId === studentId)
      },
    }),
    {
      name: 'video-record-storage',
      partialize: (state) => ({
        selectedVideoRecord: state.selectedVideoRecord,
        videoRecords: state.videoRecords,
      }),
    }
  )
)