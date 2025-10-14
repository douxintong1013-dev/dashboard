import crypto from 'crypto'
import { DatabaseService } from './databaseService.js'

export class SettingsService {
  constructor() {
    this.db = new DatabaseService()
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  // 获取或创建加密密钥
  getOrCreateEncryptionKey() {
    // 从环境变量获取加密密钥，如果没有则生成一个
    let key = process.env.ENCRYPTION_KEY
    if (!key) {
      key = crypto.randomBytes(32).toString('hex')
      console.log('⚠️  警告: 未设置ENCRYPTION_KEY环境变量，使用临时密钥')
      console.log('⚠️  建议在.env文件中设置ENCRYPTION_KEY以确保数据持久性')
    }
    return key
  }

  // 新增：从环境变量获取API密钥（不持久化，仅读取）
  getEnvApiKey() {
    const envKey = (process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY || '').trim()
    return envKey.length > 0 ? envKey : null
  }

  // 加密数据
  encrypt(text) {
    try {
      const algorithm = 'aes-256-cbc'
      const iv = crypto.randomBytes(16)
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
      const cipher = crypto.createCipheriv(algorithm, key, iv)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      return {
        encrypted,
        iv: iv.toString('hex')
      }
    } catch (error) {
      console.error('加密失败:', error)
      throw new Error('数据加密失败')
    }
  }

  // 解密数据
  decrypt(encryptedData) {
    try {
      const algorithm = 'aes-256-cbc'
      
      if (typeof encryptedData === 'string') {
        // 兼容旧格式 - 使用旧的解密方法
        const decipher = crypto.createDecipher(algorithm, this.encryptionKey)
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
      }
      
      const { encrypted, iv } = encryptedData
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
      const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'))
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('解密失败:', error)
      throw new Error('数据解密失败')
    }
  }

  // 设置API密钥
  async setApiKey(apiKey) {
    try {
      const encrypted = this.encrypt(apiKey)
      await this.db.setSetting('kimi_api_key', JSON.stringify(encrypted), true)
      
      return { success: true }
    } catch (error) {
      console.error('设置API密钥失败:', error)
      throw error
    }
  }

  // 获取API密钥（新增：当数据库没有时，自动从环境变量读取并持久化）
  async getApiKey() {
    try {
      const setting = await this.db.getSetting('kimi_api_key')
      
      if (!setting || !setting.value) {
        const envKey = this.getEnvApiKey()
        if (envKey) {
          // 持久化保存到数据库（加密）
          await this.setApiKey(envKey)
          return envKey
        }
        return null
      }
      
      // 尝试解密/返回存储的密钥；若失败，执行回退逻辑
      try {
        if (setting.encrypted) {
          const encryptedData = JSON.parse(setting.value)
          return this.decrypt(encryptedData)
        } else {
          return setting.value
        }
      } catch (decryptError) {
        console.error('解密API密钥失败，尝试使用环境变量进行修复:', decryptError)
        const envKey = this.getEnvApiKey()
        if (envKey) {
          // 使用当前环境变量密钥覆盖数据库中的损坏值
          await this.setApiKey(envKey)
          console.warn('✅ 已使用环境变量中的API密钥替换数据库中的损坏值')
          return envKey
        }
        return null
      }
    } catch (error) {
      console.error('获取API密钥失败:', error)
      return null
    }
  }

  // 删除API密钥
  async removeApiKey() {
    try {
      await this.db.deleteSetting('kimi_api_key')
      
      return { success: true }
    } catch (error) {
      console.error('删除API密钥失败:', error)
      throw error
    }
  }

  // 检查是否有API密钥
  async hasApiKey() {
    try {
      const apiKey = await this.getApiKey()
      return !!apiKey
    } catch (error) {
      console.error('检查API密钥失败:', error)
      return false
    }
  }

  // 初始化API密钥（已废弃，保留兼容性）
  async initializeApiKey() {
    try {
      // 通过 getApiKey() 获取（包含解密失败回退逻辑）
      const currentKey = await this.getApiKey()
      if (currentKey) {
        return
      }
      const envKey = this.getEnvApiKey()
      if (envKey) {
        await this.setApiKey(envKey)
        console.log('✅ 已从环境变量初始化或修复Kimi API密钥')
      } else {
        console.warn('⚠️ 未检测到KIMI_API_KEY/OPENAI_API_KEY环境变量，AI功能将不可用，您可通过 /api/ai/set-key 设置')
      }
    } catch (error) {
      console.error('初始化API密钥失败:', error)
    }
  }

  // 设置通用配置
  async setSetting(key, value, encrypted = false) {
    try {
      let finalValue = value
      
      if (encrypted && typeof value === 'string') {
        const encryptedData = this.encrypt(value)
        finalValue = JSON.stringify(encryptedData)
      }
      
      return await this.db.setSetting(key, finalValue, encrypted)
    } catch (error) {
      console.error('设置配置失败:', error)
      throw error
    }
  }

  // 获取通用配置
  async getSetting(key) {
    try {
      const setting = await this.db.getSetting(key)
      
      if (!setting) {
        return null
      }
      
      if (setting.encrypted && setting.value) {
        try {
          const encryptedData = JSON.parse(setting.value)
          setting.value = this.decrypt(encryptedData)
        } catch (error) {
          console.error('解密配置失败:', error)
          return null
        }
      }
      
      return setting
    } catch (error) {
      console.error('获取配置失败:', error)
      return null
    }
  }

  // 删除配置
  async deleteSetting(key) {
    try {
      return await this.db.deleteSetting(key)
    } catch (error) {
      console.error('删除配置失败:', error)
      throw error
    }
  }
}

// 创建单例实例
let settingsServiceInstance = null

export const getSettingsService = () => {
  if (!settingsServiceInstance) {
    settingsServiceInstance = new SettingsService()
  }
  return settingsServiceInstance
}