import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { IconButton, List } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'

import { useUserContext } from './contexts/UserContext'
import { useUserStore } from '~store/userStore'
import NoUser from './widgets/NoUser'

interface UserHomeProps {
  route?: ScreenParam.User
}

interface UserCardProps {
  user: User
  data: {
    record: number
    output: number
    income: number
  }
}

const UserCard: React.FC<UserCardProps> = ({ user, data }) => {
  const shareRef = useRef<any>(null)

  const onShare = async () => {
    try {
      const uri = await captureRef(shareRef.current, {
        format: 'png',
        quality: 0.8,
      })

      const shareOptions = {
        title: '分享到',
        url: uri,
        failOnCancel: false,
      }

      await Share.open(shareOptions)
    } catch (error) {
      console.error('捕获失败:', error)
    }
  }

  return (
    <LinearGradient
      ref={shareRef}
      colors={['#6750a4', '#a89ac7', '#e7e0ec']}
      style={card.container}>
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 20,
        }}>
        <View style={{ flex: 2 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 4,
              backgroundColor: '#e7e0ec',
            }}>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 60, height: 60, borderRadius: 4 }}
              />
            ) : (
              ''
            )}
          </View>
        </View>
        <View style={{ flex: 6, justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#e7e0ec' }}>
            {user.username || '飞翔的企鹅'}
          </Text>
          <Text style={{ color: '#e7e0ec' }}>UID: {user.id || '123456'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <IconButton
            icon={'share-outline'}
            iconColor="#a89ac7"
            onPress={onShare}
          />
        </View>
      </View>
      <View style={{ paddingVertical: 20 }}>
        <Text style={{ color: '#e7e0ec' }}>
          {user.note || '这家伙很懒，什么也没留下~'}
        </Text>
      </View>
      <View style={card.countPane}>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.record}</Text>
          <Text style={{ color: '#6750a4' }}>记录</Text>
        </View>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.output}</Text>
          <Text style={{ color: '#6750a4' }}>支出</Text>
        </View>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.income}</Text>
          <Text style={{ color: '#6750a4' }}>收入</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const UserHome: React.FC<UserHomeProps> = ({ route }) => {
  const navigation = useNavigation()

  const { keepingStore } = useUserContext()
  const { currentUser } = useUserStore()

  const { setCounting, record, output, income } = keepingStore

  useEffect(() => {
    setCounting()
  }, [navigation])

  return (
    <View style={style.container}>
      {!currentUser ? (
        <NoUser />
      ) : (
        <>
          <UserCard user={currentUser} data={{ record, output, income }} />
          <List.Section style={{
            marginTop: 20,
            paddingHorizontal: 10,
            width: '90%',
            elevation: 4,
            borderRadius: 4,
            backgroundColor: '#e6dfec',
          }} >
            <List.Item
              title="额度设置"
              left={props => (
                <List.Icon {...props} icon="counter" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="API KEY"
              left={props => (
                <List.Icon {...props} icon="file-key-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </List.Section>
          <List.Section
            style={{
              marginTop: 20,
              paddingHorizontal: 10,
              width: '90%',
              elevation: 4,
              borderRadius: 4,
              backgroundColor: '#e6dfec',
            }}>
            <List.Item
              title="编辑信息"
              left={props => (
                <List.Icon {...props} icon="account-edit-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="类型管理"
              left={props => (
                <List.Icon {...props} icon="format-list-bulleted-type" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('AddTagsScreen', {})}
            />
            <List.Item
              title="数据管理"
              left={props => (
                <List.Icon {...props} icon="database-search-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </List.Section>
        </>
      )}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

const card = StyleSheet.create({
  container: {
    width: '90%',
    height: 350,
    marginTop: 20,
    elevation: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  countPane: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 10,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNum: {
    marginRight: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6750a4',
  },
})

export default UserHome
