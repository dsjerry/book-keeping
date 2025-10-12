import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { isSensorAvailable, simplePrompt } from '@sbaiahmed1/react-native-biometrics';
import { useAppSettingsStore } from '~store/settingStore';

interface AuthGuardProps {
  children: React.ReactNode;
  onAuthFailed?: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onAuthFailed }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [biometryType, setBiometryType] = useState<string>('生物识别');
  const { useBiometrics } = useAppSettingsStore();

  const resolveBiometryLabel = (type?: string) => {
    switch (type) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return '指纹识别';
      default:
        return '生物识别';
    }
  };

  // 检查生物识别支持情况
  const checkSupport = async () => {
    try {
      const { available, biometryType } = await isSensorAvailable();
      
      setBiometryType(resolveBiometryLabel(biometryType));
      
      return available;
    } catch (error: any) {
      Alert.alert('错误', error.message);
      return false;
    }
  };

  // 执行生物识别验证
  const startAuthentication = async () => {
    setLoading(true);
    console.log('生物识别状态:', useBiometrics ? '已启用' : '未启用');
    
    // 如果未启用生物识别，则直接通过验证
    if (!useBiometrics) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }
    
    const supported = await checkSupport();
    
    if (!supported) {
      setLoading(false);
      Alert.alert('提示', '设备不支持生物识别');
      onAuthFailed?.();
      return;
    }

    try {
      console.log('正在调用生物识别验证...');
      const result = await simplePrompt(`验证以解锁应用`);
      console.log('生物识别验证结果:', result);

      if (result.success) {
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        Alert.alert('验证失败', result.error || '请重试');
        setLoading(false);
        onAuthFailed?.();
      }
    } catch (error: any) {
      console.log('生物识别验证错误:', error);
      if (error?.code !== 'USER_CANCELED') {
        Alert.alert('错误', JSON.stringify(error));
      }
      setLoading(false);
      onAuthFailed?.();
    }
  };

  // 当 useBiometrics 变化时重新验证
  useEffect(() => {
    console.log('AuthGuard 初始化, 生物识别状态:', useBiometrics ? '已启用' : '未启用');
    setIsAuthenticated(false); // 重置验证状态
    startAuthentication();
  }, [useBiometrics]); // 添加 useBiometrics 作为依赖，确保设置变化时重新验证

  // 未验证通过，显示验证界面
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.text}>正在准备验证...</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>验证未通过</Text>
            <Button title="重新验证" onPress={startAuthentication} />
          </>
        )}
      </View>
    );
  }

  // 验证通过，显示被包裹的主内容
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default AuthGuard;