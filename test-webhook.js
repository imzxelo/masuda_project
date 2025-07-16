// テスト用webhook送信スクリプト
// n8nの代わりにローカルでwebhookをテストするためのツール

const testWebhook = async () => {
  const testPayload = {
    videoRecordId: "cdfb4792-5400-4b50-bf62-54ea0ed38252",
    status: "completed"
  }

  try {
    console.log('Sending test webhook...')
    console.log('Payload:', JSON.stringify(testPayload, null, 2))
    
    const response = await fetch('http://localhost:3001/api/webhook/report-completed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// 失敗ケースのテスト
const testWebhookFailure = async () => {
  const testPayload = {
    videoRecordId: "cdfb4792-5400-4b50-bf62-54ea0ed38252",
    status: "failed",
    errorMessage: "PDF生成中にエラーが発生しました"
  }

  try {
    console.log('Sending test webhook (failure case)...')
    console.log('Payload:', JSON.stringify(testPayload, null, 2))
    
    const response = await fetch('http://localhost:3001/api/webhook/report-completed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// 使用方法:
// node test-webhook.js success  (成功ケース)
// node test-webhook.js failure  (失敗ケース)

const testType = process.argv[2] || 'success'

if (testType === 'failure') {
  testWebhookFailure()
} else {
  testWebhook()
}