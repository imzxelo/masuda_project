import { useState, useCallback } from 'react'
import { useVideoRecordStore, useUIStore } from '@/stores'
import { 
  getVideoRecords,
  getVideoRecordsByStudent,
  createVideoRecord,
  updateVideoRecord,
  deleteVideoRecord,
  searchVideoRecords
} from '@/lib/api'
import { VideoRecord, VideoRecordInput } from '@/types/video-record'

export function useVideoRecord() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { 
    selectedVideoRecord,
    videoRecords,
    setSelectedVideoRecord,
    setVideoRecords,
    addVideoRecord,
    updateVideoRecord: updateStoreVideoRecord,
    removeVideoRecord,
    clearVideoRecords,
    getVideoRecordById,
    getVideoRecordsByStudent: getStoreVideoRecordsByStudent,
    setError: setVideoRecordError
  } = useVideoRecordStore()
  
  const { addToast, setError } = useUIStore()

  const loadVideoRecords = useCallback(async (studentId?: string) => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await getVideoRecords(studentId)
      
      if (result.success) {
        setVideoRecords(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '動画レコードの取得に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [setVideoRecords, setVideoRecordError, setError, addToast])

  const loadVideoRecordsByStudent = useCallback(async (studentId: string) => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await getVideoRecordsByStudent(studentId)
      
      if (result.success) {
        // Convert VideoRecordListItem to VideoRecord format
        const videoRecords = result.data?.map(item => ({
          id: item.id,
          studentId: studentId,
          songId: item.songId,
          songTitle: item.songTitle,
          recordedAt: item.recordedAt,
          createdAt: '', // These fields might not be available in list view
          updatedAt: ''
        })) || []
        
        setVideoRecords(videoRecords)
        return videoRecords
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生徒の動画レコード取得に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [setVideoRecords, setVideoRecordError, setError, addToast])

  const createNewVideoRecord = useCallback(async (input: VideoRecordInput): Promise<VideoRecord | null> => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await createVideoRecord(input)
      
      if (result.success && result.data) {
        addVideoRecord(result.data)
        addToast({
          type: 'success',
          message: '動画レコードを作成しました'
        })
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '動画レコードの作成に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [addVideoRecord, setVideoRecordError, setError, addToast])

  const updateExistingVideoRecord = useCallback(async (
    id: string, 
    updates: Partial<Omit<VideoRecordInput, 'studentId'>>
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await updateVideoRecord(id, updates)
      
      if (result.success && result.data) {
        updateStoreVideoRecord(id, result.data)
        addToast({
          type: 'success',
          message: '動画レコードを更新しました'
        })
        return true
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '動画レコードの更新に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [updateStoreVideoRecord, setVideoRecordError, setError, addToast])

  const deleteExistingVideoRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await deleteVideoRecord(id)
      
      if (result.success) {
        removeVideoRecord(id)
        addToast({
          type: 'success',
          message: '動画レコードを削除しました'
        })
        return true
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '動画レコードの削除に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [removeVideoRecord, setVideoRecordError, setError, addToast])

  const searchVideoRecordsByQuery = useCallback(async (query: string, studentId?: string) => {
    try {
      setIsLoading(true)
      setVideoRecordError(null)
      
      const result = await searchVideoRecords(query, studentId)
      
      if (result.success) {
        setVideoRecords(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '動画レコード検索に失敗しました'
      setVideoRecordError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [setVideoRecords, setVideoRecordError, setError, addToast])

  const selectVideoRecord = useCallback((videoRecord: VideoRecord | null) => {
    setSelectedVideoRecord(videoRecord)
  }, [setSelectedVideoRecord])

  const clearAllVideoRecords = useCallback(() => {
    clearVideoRecords()
  }, [clearVideoRecords])

  return {
    // State
    selectedVideoRecord,
    videoRecords,
    isLoading,
    
    // Actions
    loadVideoRecords,
    loadVideoRecordsByStudent,
    createVideoRecord: createNewVideoRecord,
    updateVideoRecord: updateExistingVideoRecord,
    deleteVideoRecord: deleteExistingVideoRecord,
    searchVideoRecords: searchVideoRecordsByQuery,
    selectVideoRecord,
    clearVideoRecords: clearAllVideoRecords,
    
    // Utility functions
    getVideoRecordById,
    getVideoRecordsByStudent: getStoreVideoRecordsByStudent,
  }
}