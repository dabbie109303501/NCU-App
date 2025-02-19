/* eslint-disable no-console */
/* eslint-disable brace-style */
/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { getApp } from 'firebase/app'
import {
  getFirestore, collection, query, getDoc, getDocs, addDoc,
  setDoc, doc, orderBy, where, deleteDoc, deleteField, updateDoc
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject
} from 'firebase/storage'
import Fuse from 'fuse.js'
import UserController from './getStudentId'
import MessageController from './Message'

const values = ['揪人共乘', '揪人運動', '揪人遊戲', '校園活動', '系上活動', '社團活動']
const defaultLinks = {
  0:
    {
      id: '0',
      type: 'carpool',
      link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2Fcarpool.png?alt=media&token=79c907f5-01f9-429e-bc4c-039a6cccfde4'
    },
  1:
    {
      id: '1',
      type: 'exercising',
      link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2Fexercising.png?alt=media&token=aff283ca-f80b-4f9a-9a4f-26631a7533b1'
    },
  2: {
    id: '2',
    type: 'HangOut',
    link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2Fhangout.png?alt=media&token=c4746524-28a9-4e54-af12-9f06de57cf75'
  },
  3: {
    id: '3',
    type: 'schoolEvent',
    link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2FschoolEvent.png?alt=media&token=d94a9692-f843-45af-9809-f3d9acb0db51'
  },
  4: {
    id: '4',
    type: 'tiedEvent',
    link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2FtiedEvent.png?alt=media&token=9ce839a9-1df3-4edb-9755-d2241da49d4d'
  },
  5: {
    id: '5',
    type: 'clubEvent',
    link: 'https://firebasestorage.googleapis.com/v0/b/ncu-app-test.appspot.com/o/activities%2FclubEvent.png?alt=media&token=4f1e582b-3ea5-42de-82e4-c0ef9e3d5462'
  }
}

/**
 *
 * @param {*} time
 * @returns
 */

function toDateString (time) {
  const date = new Date(time)
  const dateString = `${date.getFullYear().toString()}/${
    (date.getMonth() + 1).toString().padStart(2, '0')}/${
    date.getDate().toString().padStart(2, '0')}  ${
    date.getHours().toString().padStart(2, '0')}:${
    date.getMinutes().toString().padStart(2, '0')}`
  return dateString
}

function dateToWeekday (t) {
  const time = new Date(t)
  const y = (time.getFullYear().toString())
  const c = ((time.getFullYear().toString() - 1969) % 100 === 0)
    ? ((time.getFullYear().toString() - 1969).toString().substring(0, 2) - 1)
    : (time.getFullYear().toString() - 1969).toString().substring(0, 2)
  let m = 0
  if ((time.getMonth() + 1).toString() === 1) {
    m = 13
  } else if ((time.getMonth() + 1).toString() === 2) {
    m = 14
  } else {
    m = (time.getMonth() + 1).toString()
  }
  const d = time.getDate().toString()
  const day = (y + Math.floor((y / 4)) + Math.floor((c / 4)) - 2 * c +
  Math.floor(2.6 * m + 2.6) + d * 1 - 1) % 7
  let weekday = ''
  if (day === 0) { weekday = '星期日' } else if (day === 1) { weekday = '星期一' } else if (day === 2) { weekday = '星期二' } else if (day === 3) { weekday = '星期三' } else if (day === 4) { weekday = '星期四' } else if (day === 5) { weekday = '星期五' } else if (day === 6) { weekday = '星期六' }
  const check = `${y}年 ${(time.getMonth() + 1).toString()}月${time.getDate().toString()}日 ${weekday} ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
  return check
}

function dateToWeekdayWithoutTime (t) {
  const time = new Date(t)
  const y = (time.getFullYear().toString())
  const c = ((time.getFullYear().toString() - 1969) % 100 === 0)
    ? ((time.getFullYear().toString() - 1969).toString().substring(0, 2) - 1)
    : (time.getFullYear().toString() - 1969).toString().substring(0, 2)
  let m = 0
  if ((time.getMonth() + 1).toString() === 1) {
    m = 13
  } else if ((time.getMonth() + 1).toString() === 2) {
    m = 14
  } else {
    m = (time.getMonth() + 1).toString()
  }
  const d = time.getDate().toString()
  const day = (y + Math.floor((y / 4)) + Math.floor((c / 4)) - 2 * c +
  Math.floor(2.6 * m + 2.6) + d * 1 - 1) % 7
  let weekday = ''
  if (day === 0) { weekday = '星期日' } else if (day === 1) { weekday = '星期一' } else if (day === 2) { weekday = '星期二' } else if (day === 3) { weekday = '星期三' } else if (day === 4) { weekday = '星期四' } else if (day === 5) { weekday = '星期五' } else if (day === 6) { weekday = '星期六' }
  const check = `${y}年 ${(time.getMonth() + 1).toString()}月${time.getDate().toString()}日 ${weekday}`
  return check
}

const app = getApp()
const storage = getStorage()

/**
 *
 * @param {*} rawdata
 * @returns
 */

/**
 *
 * @param {*} imageUri
 * @returns
 */
function imagePos (imageUri) {
  return imageUri.split('/').pop()
}

/**
 *
 * @param {*} active
 */
async function addActive (active) {
  const UserStudent = UserController.getUid()
  const item = {
    name: active.name,
    startTime: active.startTime,
    endTime: active.endTime,
    uploadTime: active.uploadTime,
    place: active.place.trim(),
    cost: active.cost,
    limitNum: active.limitNum,
    genre: active.genre,
    link: active.link.trim(),
    details: active.details.trim(),
    host: UserStudent,
    totalAttendee: 0,
    CloseEvent: false
  }

  if (active.image1) {
    const imageAddress = `activities/${imagePos(active.image1)}`
    const storageRef = ref(storage, imageAddress)
    const response = await fetch(active.image1)
    const blob = await response.blob()
    const uploadTask = await uploadBytes(storageRef, blob)
    item.imageUri1 = await getDownloadURL(uploadTask.ref)
  } else {
    item.imageUri1 = defaultLinks[values.indexOf(active.genre)].link
  }

  if (active.image2) {
    const imageAddress = `activities/${imagePos(active.image2)}`
    const storageRef = ref(storage, imageAddress)
    const response = await fetch(active.image2)
    const blob = await response.blob()
    const uploadTask = await uploadBytes(storageRef, blob)
    item.imageUri2 = await getDownloadURL(uploadTask.ref)
  }
  if (active.image3) {
    const imageAddress = `activities/${imagePos(active.image3)}`
    const storageRef = ref(storage, imageAddress)
    const response = await fetch(active.image3)
    const blob = await response.blob()
    const uploadTask = await uploadBytes(storageRef, blob)
    item.imageUri3 = await getDownloadURL(uploadTask.ref)
  }

  if (active.cost === 0 || active.cost === '') {
    item.cost = '免費free'
  }
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'))
  addDoc(activesRef, item).then(() => {
    console.log('Document has been added successfully')
  }).catch((error) => {
    console.log(error)
  })
  const querySnapshot = await getDocs(collection(db, 'activities'))
  querySnapshot.forEach((doc1) => {
    if (doc1.data().name === item.name) {
      setDoc(doc(db, 'attendees', `${UserStudent}`, 'hostedEvent', `${doc1.id}`), {}, { merge: true })
    }
  })

  console.log('addActive Successful')
}

/**
 *
 * @param {*} oldID
 * @param {*} NEWactive
 */
async function updateActive (oldID, NEWactive) {
  let defaultRef

  const NEWitem = NEWactive
  const db = getFirestore(app)
  const activesRef = doc(db, `activities/${oldID}`)
  const querySnapshot = await getDoc(activesRef)
  if (NEWactive.genre) {
    defaultRef = defaultLinks[values.indexOf(NEWactive.genre)].link
  } else {
    defaultRef = defaultLinks[values.indexOf(querySnapshot.data().genre)].link
  }

  // 狀況1: 主辦者沒有上傳新照片 && 換了分類 && 原本照片是上個分類的預設照片
  if (!NEWactive.image1 && NEWactive.genre && querySnapshot.data().imageUri1 === defaultLinks[values.indexOf(querySnapshot.data().genre)].link) {
    console.log('status 1: new genre link')
    NEWitem.imageUri1 = defaultRef
    delete NEWitem.image1
  }
  // 狀況2: 主辦者希望用預設照片
  else if (NEWactive.image1 === values.indexOf(querySnapshot.data().genre) || NEWactive.image1 === values.indexOf(NEWactive.genre)) {
    console.log('status 2: use default image')
    NEWitem.imageUri1 = defaultRef
    delete NEWitem.image1
  }
  // 狀況3: 主辦者第一張照片換了
  else if (NEWactive.image1) {
    if (NEWactive.image2 === 'forward') { // 如果是第二張照片往前補
      delete NEWitem.image1
      delete NEWitem.image2
      const docRef = doc(db, 'activities', oldID)
      const data = {
        imageUri1: NEWactive.image1,
        imageUri2: deleteField()
      }
      await updateDoc(docRef, data, { merge: true })
    } else {
      const imageAddress = `activities/${imagePos(NEWactive.image1)}`
      const storageRef = ref(storage, imageAddress)
      const response = await fetch(NEWactive.image1)
      const blob = await response.blob()
      const uploadTask = await uploadBytes(storageRef, blob)
      NEWitem.imageUri1 = await getDownloadURL(uploadTask.ref)
      if (querySnapshot.data().imageUri1 !== defaultLinks[values.indexOf(querySnapshot.data().genre)].link) {
        const deleteRef = ref(storage, `activities/${querySnapshot.data().imageUri1.substr(-94, 41)}`)
        deleteObject(deleteRef).then(() => {
          console.log('origin image1 has been deleted!')
        }).catch((err) => {
          console.log(err)
        })
      }
    }
    delete NEWitem.image1
    console.log('status 3: image 1 changed')
  }

  if (NEWactive.image2 === 'removed') {
    delete NEWitem.image2
    const deleteRef = ref(storage, `activities/${querySnapshot.data().imageUri2.substr(-94, 41)}`)
    deleteObject(deleteRef).then(() => {
      console.log('origin image2 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
  } else if (NEWactive.image3 === 'forward') {
    delete NEWitem.image2
    delete NEWitem.image3
    const docRef = doc(db, 'activities', oldID)
    const data = {
      imageUri2: NEWactive.image2,
      imageUri3: deleteField()
    }
    await updateDoc(docRef, data, { merge: true })
  } else if (NEWactive.image2 !== undefined) {
    const imageAddress = `activities/${imagePos(NEWactive.image2)}`
    const storageRef = ref(storage, imageAddress)
    const response = await fetch(NEWactive.image2)
    const blob = await response.blob()
    const uploadTask = await uploadBytes(storageRef, blob)
    NEWitem.imageUri2 = await getDownloadURL(uploadTask.ref)
    const deleteRef = ref(storage, `activities/${querySnapshot.data().imageUri2.substr(-94, 41)}`)
    deleteObject(deleteRef).then(() => {
      console.log('origin image2 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
    delete NEWitem.image2
  }

  if (NEWactive.image3 === 'removed') {
    delete NEWitem.image3
    const deleteRef = ref(storage, `activities/${querySnapshot.data().imageUri3.substr(-94, 41)}`)
    deleteObject(deleteRef).then(() => {
      console.log('origin image3 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
  } else if (NEWactive.image3 !== undefined) {
    const imageAddress = `activities/${imagePos(NEWactive.image3)}`
    const storageRef = ref(storage, imageAddress)
    const response = await fetch(NEWactive.image3)
    const blob = await response.blob()
    const uploadTask = await uploadBytes(storageRef, blob)
    NEWitem.imageUri3 = await getDownloadURL(uploadTask.ref)
    const deleteRef = ref(storage, `activities/${querySnapshot.data().imageUri3.substr(-94, 41)}`)
    deleteObject(deleteRef).then(() => {
      console.log('origin image3 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
    delete NEWitem.image3
  }

  if (NEWactive.cost) {
    if (NEWactive.cost === 0 || NEWactive.cost === '') {
      NEWitem.cost = '免費free'
    }
  }

  if (NEWitem) {
    setDoc(activesRef, NEWitem, { merge: true })
      .then(() => { console.log('updateActive Successful') })
  }
}

async function getAllActive () {
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'), orderBy('uploadTime', 'desc'))
  const activeArray = []
  const querySnapshot = await getDocs(activesRef)
  querySnapshot.forEach((doc1) => {
    activeArray.push({
      id: doc1.id,
      name: doc1.data().name,
      imageUri1: doc1.data().imageUri1,
      startTimeWeekday: dateToWeekday(doc1.data().startTime.toDate()),
      startTimeInNum: toDateString(doc1.data().startTime.toDate()),
      place: doc1.data().place,
      cost: doc1.data().cost,
      limitNum: doc1.data().limitNum,
      genre: doc1.data().genre,
      link: doc1.data().link,
      hostName: doc1.data().hostName,
      hostPhone: doc1.data().hostPhone,
      hostMail: doc1.data().hostMail,
      details: doc1.data().details
    })
  })
  return activeArray
}

async function getGenreActive (genre) {
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'), where('genre', '==', genre))
  const GenreArray = []
  const querySnapshot = await getDocs(activesRef)

  querySnapshot.forEach((doc1) => {
    GenreArray.push({
      id: doc1.id,
      name: doc1.data().name,
      imageUri1: doc1.data().imageUri1,
      imageUri2: doc1.data().imageUri2,
      imageUri3: doc1.data().imageUri3,
      startTime: toDateString(doc1.data().startTime.toDate()),
      endTime: toDateString(doc1.data().endTime.toDate()),
      startTimeWeekday: dateToWeekday(doc1.data().startTime.toDate()),
      endTimeWeekday: dateToWeekday(doc1.data().endTime.toDate()),
      place: doc1.data().place.length < 10 ? doc1.data().place : doc1.data().place.slice(0, 8) + '...',
      cost: doc1.data().cost,
      limitNum: doc1.data().limitNum,
      genre: doc1.data().genre,
      link: doc1.data().link,
      hostName: doc1.data().hostName,
      hostPhone: doc1.data().hostPhone,
      hostMail: doc1.data().hostMail,
      details: doc1.data().details
    })
  })
  return GenreArray
}

async function getParticipatedActive () {
  const UserStudent = await UserController.getUid()
  const db = getFirestore(app)
  const attendRef = query(collection(db, `attendees/${UserStudent}/attendedEvent`))
  const attendIDArray = []
  const activeArray = []
  const current = new Date()
  const querySnapshot = await getDocs(attendRef)
  querySnapshot.forEach((attendID) => {
    attendIDArray.push(attendID.id)
  })

  for (let i = 0; i < attendIDArray.length; i += 1) {
    const refDoc = doc(db, `activities/${attendIDArray[i]}`)
    const result = await getDoc(refDoc)

    if (result.data().endTime.toDate() >= current) {
      activeArray.push({
        id: result.id,
        name: result.data().name,
        imageUri1: result.data().imageUri1,
        time: dateToWeekdayWithoutTime(result.data().startTime.toDate()),
        startTimeWeekday: dateToWeekday(result.data().startTime.toDate()),
        startTimeInNum: toDateString(result.data().startTime.toDate()),
        place: result.data().place.length < 10 ? result.data().place : result.data().place.slice(0, 8) + '...',
        cost: result.data().cost,
        limitNum: result.data().limitNum,
        genre: result.data().genre,
        link: result.data().link,
        hostName: result.data().hostName,
        hostPhone: result.data().hostPhone,
        hostMail: result.data().hostMail,
        details: result.data().details,
        num: result.data().totalAttendee
      })
    }
  }
  return activeArray
}

async function getFinishedActive () {
  const UserStudent = UserController.getUid()
  const db = getFirestore(app)
  const attendRef = query(collection(db, `attendees/${UserStudent}/attendedEvent`))
  const attendIDArray = []
  const activeArray = []
  const current = new Date()
  const querySnapshot = await getDocs(attendRef)
  querySnapshot.forEach((attendID) => {
    attendIDArray.push(attendID.id)
  })
  for (let i = 0; i < attendIDArray.length; i += 1) {
    const refDoc = doc(db, `activities/${attendIDArray[i]}`)
    const result = await getDoc(refDoc)
    if (result.data().endTime.toDate() < current) {
      activeArray.push({
        id: result.id,
        name: result.data().name,
        imageUri1: result.data().imageUri1,
        startTimeWeekday: dateToWeekday(result.data().startTime.toDate()),
        startTimeInNum: toDateString(result.data().startTime.toDate()),
        place: result.data().place.length < 10 ? result.data().place : result.data().place.slice(0, 8) + '...',
        cost: result.data().cost,
        limitNum: result.data().limitNum,
        genre: result.data().genre,
        link: result.data().link,
        hostName: result.data().hostName,
        hostPhone: result.data().hostPhone,
        hostMail: result.data().hostMail,
        details: result.data().details,
        num: result.data().totalAttendee
      })
    }
  }
  return activeArray
}

async function getOneActive (id) {
  const db = getFirestore(app)
  const activesDoc = doc(db, `activities/${id}`)

  const querySnapshot = await getDoc(activesDoc)
  const oneactive = {
    id: querySnapshot.id,
    name: querySnapshot.data().name,
    imageUri1: querySnapshot.data().imageUri1,
    endTime: querySnapshot.data().endTime.toDate(),
    startTimeInNum: toDateString(querySnapshot.data().startTime.toDate()),
    endTimeInNum: toDateString(querySnapshot.data().endTime.toDate()),
    startTimeWeekday: dateToWeekday(querySnapshot.data().startTime.toDate()),
    endTimeWeekday: dateToWeekday(querySnapshot.data().endTime.toDate()),
    place: querySnapshot.data().place,
    cost: querySnapshot.data().cost,
    limitNum: querySnapshot.data().limitNum,
    genre: querySnapshot.data().genre,
    genreIndex: querySnapshot.data().genreIndex,
    link: querySnapshot.data().link,
    hostName: querySnapshot.data().hostName,
    hostPhone: querySnapshot.data().hostPhone,
    hostMail: querySnapshot.data().hostMail,
    details: querySnapshot.data().details,
    totalAttendee: querySnapshot.data().totalAttendee,
    CloseEvent: querySnapshot.data().CloseEvent
  }
  if (querySnapshot.data().imageUri2) {
    oneactive.imageUri2 = querySnapshot.data().imageUri2
  }
  if (querySnapshot.data().imageUri3) {
    oneactive.imageUri3 = querySnapshot.data().imageUri3
  }

  return [oneactive]
}

/**
 *
 * @param {*} genre
 * @returns
 */

async function getHangOutActive () {
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'), where('genre', 'in', ['揪人遊戲', '揪人共乘', '揪人運動']))
  const GenreArray = []
  const querySnapshot = await getDocs(activesRef)
  querySnapshot.forEach((doc1) => {
    GenreArray.push({
      id: doc1.id,
      name: doc1.data().name,
      imageUri1: doc1.data().imageUri1,
      imageUri2: doc1.data().imageUri2,
      imageUri3: doc1.data().imageUri3,
      startTime: toDateString(doc1.data().startTime.toDate()),
      endTime: toDateString(doc1.data().endTime.toDate()),
      startTimeWeekday: dateToWeekday(doc1.data().startTime.toDate()),
      endTimeWeekday: dateToWeekday(doc1.data().endTime.toDate()),
      place: doc1.data().place.length < 10 ? doc1.data().place : doc1.data().place.slice(0, 8) + '...',
      cost: doc1.data().cost,
      limitNum: doc1.data().limitNum,
      genre: doc1.data().genre,
      link: doc1.data().link,
      hostName: doc1.data().hostName,
      hostPhone: doc1.data().hostPhone,
      hostMail: doc1.data().hostMail,
      details: doc1.data().details
    })
  })
  console.log('GenreArray', GenreArray)
  return GenreArray
}

async function getEventActive () {
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'), where('genre', 'in', ['校園活動', '系上活動', '社團活動']))
  const EventArray = []
  const querySnapshot = await getDocs(activesRef)
  querySnapshot.forEach((doc1) => {
    EventArray.push({
      id: doc1.id,
      name: doc1.data().name,
      imageUri1: doc1.data().imageUri1,
      imageUri2: doc1.data().imageUri2,
      imageUri3: doc1.data().imageUri3,
      startTime: toDateString(doc1.data().startTime.toDate()),
      endTime: toDateString(doc1.data().endTime.toDate()),
      startTimeWeekday: dateToWeekday(doc1.data().startTime.toDate()),
      endTimeWeekday: dateToWeekday(doc1.data().endTime.toDate()),
      place: doc1.data().place.length < 10 ? doc1.data().place : doc1.data().place.slice(0, 8) + '...',
      cost: doc1.data().cost,
      limitNum: doc1.data().limitNum,
      genre: doc1.data().genre,
      link: doc1.data().link,
      details: doc1.data().details
    })
  })
  return EventArray
}

async function deleteOneActive (deleteDocId) {
  const db = getFirestore(app)
  const activesRef = query(doc(db, 'activities', deleteDocId))
  const dltDoc = await getDoc(activesRef)
  if (dltDoc.data().imageUri1 !== defaultLinks[values.indexOf(dltDoc.data().genre)].link) {
    if (dltDoc.data().imageUri1) {
      const uriRef1 = ref(storage, `activities/${dltDoc.data().imageUri1.substr(-94, 41)}`)
      deleteObject(uriRef1).then(() => {
        console.log('Image 1 has been deleted!')
      }).catch((err) => {
        console.log(err)
      })
    }
  }
  if (dltDoc.data().imageUri2) {
    const uriRef2 = ref(storage, `activities/${dltDoc.data().imageUri2.substr(-94, 41)}`)
    deleteObject(uriRef2).then(() => {
      console.log('Image 2 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
  }
  if (dltDoc.data().imageUri3) {
    const uriRef3 = ref(storage, `activities/${dltDoc.data().imageUri3.substr(-94, 41)}`)
    deleteObject(uriRef3).then(() => {
      console.log('Image 3 has been deleted!')
    }).catch((err) => {
      console.log(err)
    })
  }

  await deleteDoc(doc(db, 'activities', deleteDocId))
  console.log('deleteOneActive Successful')
}

async function getTotalOfAttendees (docID) {
  const db = getFirestore(app)
  const totalRef = query(collection(db, 'attendees'))
  const querySnapshot = await getDocs(totalRef)
  const attendeeList = []
  const total = []
  querySnapshot.forEach((attendee) => {
    attendeeList.push(attendee.id)
  })
  for (let i = 0; i < attendeeList.length; i += 1) {
    const result = await getDocs(collection(db, `attendees/${attendeeList[i]}/attendedEvent`))
    result.forEach((event) => {
      if (event.id === docID) {
        total.push(attendeeList[i])
      }
    })
  }
  return total.length
}

async function getAllAttendees (docID) {
  const db = getFirestore(app)
  const infoRef = query(collection(db, 'attendees'))
  const querySnapshot = await getDocs(infoRef)
  const attendeeList = []
  const IDlist = []
  const info = []
  querySnapshot.forEach((attendee) => {
    attendeeList.push(attendee.id)
  })
  for (let i = 0; i < attendeeList.length; i += 1) {
    const result = await getDocs(collection(db, `attendees/${attendeeList[i]}/attendedEvent`), orderBy('signUpTime', 'asc'))
    result.forEach((event) => {
      if (event.id === docID) {
        IDlist.push(attendeeList[i])
      }
    })
  }
  for (let j = 0; j < IDlist.length; j += 1) {
    const infoDoc = doc(db, `attendees/${IDlist[j]}`)
    const querySnapshot2 = await getDoc(infoDoc)
    info.push({ uid: querySnapshot2.id, ...querySnapshot2.data() })
  }
  return info
}
async function deleteEverySingleAttendee (docID) {
  const db = getFirestore(app)
  const docRef = doc(db, `activities/${docID}`)

  const update = {
    totalAttendee: 0
  }

  await updateDoc(docRef, update, { merge: true })

  const activesRef = query(collection(db, 'attendees'))
  const querySnapshot = await getDocs(activesRef)
  querySnapshot.forEach(async (student) => {
    await deleteDoc(doc(db, 'attendees', `${student.id}`, 'attendedEvent', `${docID}`))
    await deleteDoc(doc(db, 'attendees', `${student.id}`, 'hostedEvent', `${docID}`))
  })
  console.log('delete successfully!')
}

async function removeAttendee (docID, studentUid) { // remove attendee
  const user = UserController.getUid()
  const db = getFirestore(app)
  const docRef = doc(db, `activities/${docID}`)
  const activeRef = await getDoc(docRef)

  const update = {
    totalAttendee: activeRef.data().totalAttendee - 1
  }

  await updateDoc(docRef, update, { merge: true })

  const activesRef = query(collection(db, `attendees/${studentUid}/attendedEvent`))
  await deleteDoc(doc(db, 'attendees', studentUid, 'attendedEvent', docID))
  console.log('delete successfully!')
  const result = await getDocs(activesRef)
  result.forEach((doc1) => console.log(doc1.id))

  const chatroomID = await MessageController.addChatroom(studentUid, user)
  const messageData = {
    id: chatroomID,
    sender: user,
    type: 'text',
    data: '(此為自動發出的訊息)你已被移出 【' + activeRef.data().name + '】，此活動的參加名單！',
    sendTime: new Date(),
    read: false
  }

  await MessageController.addMessage(messageData)
}

async function addUser (uid, newUserInfo) {
  const db = getFirestore(app)
  const attendeeRef = query(collection(db, 'attendees'))
  const memberInfo = newUserInfo
  const imageAddress = `avatar/${imagePos(newUserInfo.avatar)}`
  const storageRef = ref(storage, imageAddress)
  const response = await fetch(newUserInfo.avatar)
  const blob = await response.blob()
  const uploadTask = await uploadBytes(storageRef, blob)
  memberInfo.avatar = await getDownloadURL(uploadTask.ref)
  console.log(memberInfo)

  setDoc(doc(db, 'attendees', `${uid}`), memberInfo, { merge: true })
    .then(console.log('succeed'))
  const result = await getDocs(attendeeRef)
  result.forEach((doc1) => console.log(doc1.data()))
}

async function getHostedEvent () {
  const UserStudent = UserController.getUid()
  const db = getFirestore(app)
  const Ref = query(collection(db, `attendees/${UserStudent}/hostedEvent`))
  const hostIDArray = []
  const eventArray = []
  const querySnapshot = await getDocs(Ref)
  querySnapshot.forEach((doc1) => {
    hostIDArray.push(doc1.id)
  })
  for (let i = 0; i < hostIDArray.length; i += 1) {
    const refDoc = doc(db, `activities/${hostIDArray[i]}`)
    const result = await getDoc(refDoc)

    eventArray.push({
      id: result.id,
      name: result.data().name,
      imageUri1: result.data().imageUri1,
      startTimeWeekday: dateToWeekday(result.data().startTime.toDate()),
      startTimeInNum: toDateString(result.data().startTime.toDate()),
      place: result.data().place.length < 10 ? result.data().place : result.data().place.slice(0, 8) + '...',
      cost: result.data().cost,
      limitNum: result.data().limitNum,
      genre: result.data().genre,
      link: result.data().link,
      hostName: result.data().hostName,
      hostPhone: result.data().hostPhone,
      hostMail: result.data().hostMail,
      details: result.data().details,
      num: result.data().totalAttendee
    })
  }
  return eventArray
}

async function signUp (docID) {
  const UserStudent = UserController.getUid()
  const db = getFirestore(app)
  const docRef = doc(db, `activities/${docID}`)
  const activeRef = await getDoc(docRef)

  const update = {
    totalAttendee: activeRef.data().totalAttendee + 1
  }

  await updateDoc(docRef, update, { merge: true })

  const Ref = doc(db, `attendees/${UserStudent}/attendedEvent/${docID}`)
  const signUpTime = new Date()
  setDoc(Ref, { signUpTime })
    .then(() => {
      console.log('sign up successfully!')
    })
    .catch((error) => {
      console.log(error)
    })
  const result = await getDocs(collection(db, `attendees/${UserStudent}/attendedEvent`))
  result.forEach((doc1) => console.log(doc1.id))
}

async function quitEvent (docID) {
  const UserStudent = UserController.getUid()
  const db = getFirestore(app)

  const docRef = doc(db, `activities/${docID}`)
  const activeRef = await getDoc(docRef)

  const update = {
    totalAttendee: activeRef.data().totalAttendee - 1
  }

  await updateDoc(docRef, update, { merge: true })
  const Ref = doc(db, `attendees/${UserStudent}/attendedEvent/${docID}`)
  deleteDoc(Ref)
    .then(() => {
      console.log('delete successfully!')
    })
    .catch((error) => {
      console.log(error)
    })
  const result = await getDocs(collection(db, `attendees/${UserStudent}/attendedEvent`))
  result.forEach((doc1) => console.log(doc1.id))
}

async function getHostInfo (docID) {
  const db = getFirestore(app)
  const activityRef = query(collection(db, 'activities'))
  const querySnapshot = await getDocs(activityRef)
  let hostID
  const info = []

  querySnapshot.forEach((e) => {
    if (e.id === docID) {
      hostID = e.data().host
    }
  })
  const querySnapshot2 = await getDoc(doc(db, `attendees/${hostID}`))
  info.push({ uid: querySnapshot2.id, ...querySnapshot2.data() })
  console.log(info)
  return info
}

async function fuseSearchName (searchString) {
  const db = getFirestore(app)
  const activesRef = query(collection(db, 'activities'))
  const activeArray = []
  const querySnapshot = await getDocs(activesRef)

  querySnapshot.forEach((doc1) => {
    activeArray.push({
      id: doc1.id,
      name: doc1.data().name
    })
  })

  const options = {
    includeScore: true,
    keys: ['name']
  }

  const fuse = new Fuse(activeArray, options)
  const result = fuse.search(searchString)
  console.log('Search Successful')
  return result
}

async function getAttendedOrNot (docID) {
  const UserStudent = UserController.getUid()
  const result = []
  const db = getFirestore(app)
  const attendRef = query(collection(db, `attendees/${UserStudent}/attendedEvent`))
  const querySnapshot = await getDocs(attendRef)
  querySnapshot.forEach((attendID) => {
    if (attendID.id === docID) {
      result.push(docID)
    }
  })
  if (result.length) {
    return true
  }
  return false
}

async function getHostinAdd () {
  const Uid = UserController.getUid()
  const db = getFirestore(app)
  const infoRef = query(doc(db, `attendees/${Uid}`))
  const querySnapshot = await getDoc(infoRef)

  return querySnapshot.data()
}

async function closeEvent (docID) {
  const db = getFirestore(app)

  const docRef = doc(db, `activities/${docID}`)
  console.log(docID)

  const update = {
    CloseEvent: true
  }

  await updateDoc(docRef, update, { merge: true })
}

async function openEvent (docID) {
  const db = getFirestore(app)

  const docRef = doc(db, `activities/${docID}`)
  console.log(docID)
  const update = {
    CloseEvent: false
  }

  await updateDoc(docRef, update, { merge: true })
}

export default {
  toDateString,
  addActive,
  updateActive,
  getAllActive,
  getGenreActive,
  getParticipatedActive,
  getHostedEvent,
  getFinishedActive,
  getHangOutActive,
  getEventActive,
  deleteOneActive,
  deleteEverySingleAttendee,
  getOneActive,
  fuseSearchName,
  addUser,
  signUp,
  quitEvent,
  getHostInfo,
  getAllAttendees,
  getTotalOfAttendees,
  removeAttendee,
  getAttendedOrNot,
  getHostinAdd,
  closeEvent,
  openEvent
}
