import React, { useState, useEffect } from 'react'
import {
  RefreshControl, Image
} from 'react-native'
import {
  FontAwesome5, AntDesign, Feather, Octicons, Ionicons
} from '@expo/vector-icons'
import {
  Divider, Box, FlatList, VStack, Pressable, HStack, Text, ZStack, Center
} from 'native-base'
import styles from './style_folder/Styles_moreEvent'
import ActiveController from '../../controller/Active'
import MessageController from '../../controller/Message'

function ActivityCard (props) {
  const key = props.id
  const id = props.id
  const name = props.name
  const imageUri1 = props.imageUri1
  const place = props.place
  const startTime = props.startTime
  const navigation = props.navigation

  return (
    <Pressable
      border="1"
      borderRadius="md"
      key={key}
      width="180px"
      height="99%"
      mx={2}
      bgColor={'white'}
      shadow="2"
      onPress={() => {
        navigation.navigate('details', { Cd: id, prepage: 'list' })
      }}
    >
      <VStack divider={<Divider />}>
        <Image
          alt="eventPic"
          style={styles.pic}
          source={{
            uri: imageUri1
          }}
        />
        <VStack p={2}>
          <Text fontSize="xs" bold color="gray.600">
            {startTime}
          </Text>
          <Text fontSize="md" bold color="primary.600">
            {name}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  )
}

function MoreHang ({ navigation, route }) {
  const [Messagenum, setMessageNum] = useState(0)
  useEffect(() => {
    MessageController.countUnreadMessage().then((num) => {
      setMessageNum(num)
    }).catch((err) => {
      throw err
    })
  }, [])
  const [active, setActive] = useState([])
  useEffect(() => {
    ActiveController.getHangOutActive().then((res) => {
      setActive(res)
    }).catch((err) => {
      throw err
    })
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = () => {
    setRefreshing(true)
    ActiveController.getHangOutActive().then((res) => {
      setActive(res)
    })
    MessageController.countUnreadMessage().then((num) => {
      setMessageNum(num)
    }).catch((err) => {
      throw err
    })
    setRefreshing(false)
  }

  return (
    <Box style={styles.container} safeArea>
        <Box style={styles.headerContainer}>
          <HStack width="100%" alignItems="center" justifyContent="center">
            <Pressable style={styles.headerArrowBox}>
              <AntDesign
                name="arrowleft"
                size={28}
                color="#476685"
                onPress={() => { navigation.navigate('list') }}
              />
            </Pressable>
            <Box style={styles.nameheader}>
              <Text style={styles.name}>
                近期揪人
              </Text>
            </Box>
            <Pressable
              onPress={() => { navigation.navigate('message', { prepage: 'list' }) }}
            >
              <Center>
                <ZStack size={25} ml={3} alignItems="center" justifyContent="center">
                  <Box>
                    <Octicons
                      name="dot-fill"
                      size={16}
                      color={Messagenum !== 0 ? '#EB6F6F' : 'transparent'}
                      style={{
                        transform: [{ translateX: 12 }, { translateY: -10 }]
                      }}
                    />
                  </Box>
                  <Box>
                    <FontAwesome5
                      name="comment"
                      size={25}
                      color="#476685"
                    />
                  </Box>

                  {/* // 要記得變0 */}
                </ZStack>
              </Center>
            </Pressable>
            <Pressable
              onPress={() => { navigation.navigate('personal') }}
            >
              <Box size={26} mx={3}>
                <Feather
                  name="user"
                  size={26}
                  color="#476685"
                />
              </Box>
            </Pressable>
          </HStack>
        </Box>
        <Box style={styles.bodyContainer}>
            <FlatList
              numColumns={2}
              data={active}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              refreshControl={(
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
                )}
              renderItem={({ item }) => (
                    <ActivityCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      imageUri1={item.imageUri1}
                      place={item.place}
                      startTime={item.startTime}
                      navigation={navigation}
                    />
              )
              }
            />
        </Box>
    </Box>
  )
}

export default MoreHang
