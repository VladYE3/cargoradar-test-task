import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

//packages
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '@react-native-vector-icons/entypo';
import {Picker} from '@react-native-picker/picker';

//components
import {MainMap} from '../../components/MapComponents/MainMap';
import IconPinSmallOt from '../../components/Svg/IconPinSmallOt';
import IconPinSmallFill from '../../components/Svg/IconPinSmallFill';
import {BtnIconTrs} from '../../components/Buttons/BtnIconTrs';
import ListPoints from '../../components/ListPoints/ListPoints';
import InfoAskWindow from '../../components/Modal/InfoAskWindow';
import {HeaderTitleComponentNoBg} from '../../components/Headers/HeaderTitleComponentNoBg';
import {DefaultBtnOutline} from '../../components/Buttons/DefaultBtnOutline';

//functions && features && slice
import {
  askResetTender,
  height,
  promptSuccCrTend,
  width,
} from '../../util/helperConst';
import {
  onChangeIndexOfPoint,
  onDeletePoint,
  onResetTender,
  setInfoTender,
} from '../../store/features/addTenderSlice';
import {calculateTotalWeight, findJsonObj} from '../../util/tools';

//styles
import {THEME, mainstyles} from '../../theme';
import {compressImages, getUrlUploadImage} from '../../util/uploadFilesHelper';
import {uploadImages} from '../../store/features/Upload/uploadfiles';
import {post} from '../../store/features/api/user-api';
import {setUserFormDataFromDB} from '../../store/features/api/userInfoForms';

const CreateTenderScreen = ({route, navigation}) => {
  console.log(
    '\x1b[34m%s %s\x1b[0m \x1b[34m%s',
    'screens > CreateTender > CreateTenderScreen.js',
    'route:',
    route,
  );
  const mapViewRef = useRef(null);
  const titleRef = useRef(null);
  const discrRef = useRef(null);
  let scrollref = useRef(null);
  const safeInsets = useSafeAreaInsets();
  const jsonDataPrompt = useSelector(state => state.jsoninfo.jsonDataPrompt);
  const dataTender = useSelector(state => state.addTender.tender);
  const userProfile = useSelector(state => state.login.userProfileInfo);
  const {userFormsInfo} = useSelector(state => state.login);
  // console.log('userProfile', userProfile)
  const [title, setTitle] = useState('');
  const [description, setDiscription] = useState('');
  const [sum, setSum] = useState(0);
  const [sumWeight, setSumWeight] = useState(0);
  const [isOpenList, setIsOpenList] = useState(false);
  const [listPoint, setListPoint] = useState('');
  const [coordinatesFrom, setCoordinatesFrom] = useState([]);
  const [coordinatesTo, setCoordinatesTo] = useState([]);
  const [routeInfo, setRouteInfo] = useState({
    distance: '',
    duration: '',
  });
  const [coordinates, setCoordinates] = useState([]);
  const [isDisableBtn, setIsDisableBtn] = useState(true);
  const [isAskResetVisible, setIsAskResetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessedCreate, setIsSuccessedCreate] = useState(false);
  const [isShowReset, setIsShowReset] = useState(false);
  const [transportType, setTransportType] = useState('');
  const dispatch = useDispatch();

  const onOpenList = point => {
    console.log('onOpenList btn', point);

    setIsOpenList(true);
    setListPoint(point);
  };
  const onOpenCreatePoint = point => {
    if (point === 'start') {
      dataTender.startPoints.length === 0
        ? navigation.navigate('CreateStartPoint', {firstOpen: true})
        : navigation.navigate('CreateStartPoint', {firstOpen: false});
    } else if (point === 'end') {
      dataTender.endPoints.length === 0
        ? navigation.navigate('CreateEndPoint', {firstOpen: true})
        : navigation.navigate('CreateEndPoint', {firstOpen: false});
    }
  };

  const handleSaveText = (flag, value) => {
    if (value !== undefined && value.trim().length > 0) {
      dispatch(setInfoTender({type: flag, data: value}));
      flag === 'title' ? setTitle(value) : setDiscription(value);
    } else {
      dispatch(setInfoTender({type: flag, data: ''}));
      flag === 'title' ? setTitle('') : setDiscription('');
    }
  };

  const handleEditPoint = (item, index, point) => {
    console.log('handleEditPoint: ');
    if (point === 'start') {
      navigation.navigate('CreateStartPoint', {
        data: {item: item, index: index, type: point, action: 'edit'},
      });
    } else {
      navigation.navigate('CreateEndPoint', {
        data: {item: item, index: index, type: point, action: 'edit'},
      });
    }
  };
  const handleDeletePoint = (index, point) => {
    console.log('handleDeletePoint: ');
    dispatch(onDeletePoint({type: point, data: index}));
  };
  const handleChangeIndexPoint = data => {
    console.log('handleChangeIndexPoint: ');
    dispatch(onChangeIndexOfPoint(data));
  };
  const handleOpenAsk = () => {
    console.log('handleOpenAsk');
    Keyboard.dismiss();
    if (
      dataTender.data.name?.length > 0 ||
      dataTender.data.description?.length > 0 ||
      dataTender.data.price !== null ||
      dataTender.startPoints?.length > 0 ||
      dataTender.endPoints?.length > 0
    ) {
      console.log(
        '!!!!!!',
        dataTender.data.name?.length > 0 ||
          dataTender.data.description?.length > 0 ||
          dataTender.data.price !== null ||
          dataTender.startPoints?.length > 0 ||
          dataTender.endPoints?.length > 0,
      );
      setIsAskResetVisible(true);
    } else {
      setIsAskResetVisible(true);
      // navigation.goBack()
    }
  };

  const handleResetState = flag => {
    console.log('handleResetState');
    setIsAskResetVisible(false);
    dispatch(onResetTender());
    setTitle('');
    setDiscription('');
    setSum(0);
    setSumWeight(0);
    setIsDisableBtn(true);
    setCoordinatesFrom([]);
    setCoordinatesTo([]);
    setRouteInfo({
      distance: '',
      duration: '',
    });
    setCoordinates([]);
    setIsSuccessedCreate(false);
    setTransportType('');
    if (flag === 'nav') {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TendersTab',
            state: {
              routes: [{name: 'Tenders'}],
            },
          },
        ],
      });
    } else {
      setIsAskResetVisible(false);
      setIsSuccessedCreate(false);
    }
  };
  const createRouteInfo = result => {
    setRouteInfo({
      distance: result.distance.toFixed(1),
      duration: result.duration,
    });
  };

  const uploadImage = async photo => {
    console.log('uploadImage image url:', photo);

    const compressResult = await compressImages(photo);
    try {
      const objToUpload = await getUrlUploadImage(compressResult);
      console.log('objToUpload', objToUpload);
      const uris = await uploadImages(objToUpload, 'tenders');
      console.log('uris', uris);
      return uris;
    } catch (error) {
      console.log('local fn uploadImage error', error);
      return [];
    }
  };

  const updateImagesInStartPoints = async startPoints => {
    const updatedStartPoints = await Promise.all(
      startPoints.map(async point => {
        if (!Array.isArray(point.images) || point.images.length === 0) {
          return point;
        }
        const updatedImages = await uploadImage(point.images);
        console.log('updatedImages', updatedImages);
        if (updatedImages?.message) {
          console.error('Ошибка загрузки изображений:', updatedImages.message);
          return {
            ...point,
            images: [],
          };
        }
        return {
          ...point,
          images: updatedImages.filter(url => !!url),
        };
      }),
    );
    return updatedStartPoints;
  };

  const handleCreateTender = async () => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const updatedStartPoints = await updateImagesInStartPoints(
        dataTender.startPoints,
      );
      console.log('updatedStartPoints', updatedStartPoints);
      let tenderObj = {
        status: 'publish',
        statusMsg: '',
        archived: false,
        isEdit: null,
        finishedAt: null,
        orderStartedAt: null,
        driverId: null,
        replyId: null,
        name: dataTender.data?.name?.trim(),
        description: dataTender.data?.description?.trim(),
        price: sum,
        startPoints: updatedStartPoints,
        endPoints: dataTender.endPoints,
        route: routeInfo,
        userId: userProfile.id,
        usersIdWithBet: [],
        usersIdWithChat: [],
        transportType: transportType,
      };

      console.log('tenderObj', tenderObj);

      const response = await post('tenders', tenderObj);

      if (!response.success) {
        console.warn('Ошибка запроса:', response.error);
        Alert.alert('Ошибка', response.error);
        return;
      }
      let count =
        userFormsInfo.profile.quantityTenders !== null
          ? ++userFormsInfo.profile.quantityTenders
          : 1;
      let obj = {
        profile: {
          quantityTenders: count,
        },
      };
      setUserFormDataFromDB(dispatch, obj);
      setIsLoading(false);
      setIsSuccessedCreate(true);
    } catch (error) {
      setIsLoading(false);
      console.log(' error', error);
      Alert.alert(
        'Ошибка создания заявки',
        `err: ${JSON.stringify(error)} msg: ${JSON.stringify(error?.messages)}`,
      );
    }
  };

  useEffect(() => {
    const onCreateRoutePoints = () => {
      console.log(' onCreateRoutePoints START');

      const coordsFrom = dataTender.startPoints.map((item, index) => {
        return item.coords;
      });
      const coordsTo = dataTender.endPoints.map((item, index) => {
        return item.coords;
      });

      const coordsRoute = coordsFrom.concat(coordsTo);
      setCoordinates(coordsRoute);
    };
    if (dataTender.startPoints.length > 0 || dataTender.endPoints.length > 0) {
      onCreateRoutePoints();
    }
  }, [dataTender]);

  useEffect(() => {
    if (dataTender.startPoints.length > 0 || dataTender.endPoints.length > 0) {
      const coordsFrom = dataTender.startPoints.map((item, index) => {
        return item.coords;
      });
      const coordsTo = dataTender.endPoints.map((item, index) => {
        return item.coords;
      });
      setCoordinatesFrom(coordsFrom);
      setCoordinatesTo(coordsTo);
    }
  }, [dataTender]);

  useEffect(() => {
    if (
      title !== null &&
      title !== undefined &&
      title?.trim()?.length > 0 &&
      sum !== null &&
      sum !== undefined &&
      sum > 0 &&
      dataTender.startPoints?.length > 0 &&
      dataTender.endPoints?.length > 0
    ) {
      setIsDisableBtn(false);
    } else {
      setIsDisableBtn(true);
    }
  }, [dataTender, title, description, sum]);

  useEffect(() => {
    if (
      (title !== null && title !== undefined && title?.trim()?.length > 0) ||
      (description !== null &&
        title !== description &&
        description?.trim()?.length > 0) ||
      dataTender.startPoints?.length > 0 ||
      dataTender.endPoints?.length > 0
    ) {
      setIsShowReset(true);
    } else {
      setIsShowReset(false);
    }
  }, [dataTender, title, description]);

  useEffect(() => {
    if (dataTender.startPoints?.length > 0) {
      let price = dataTender.startPoints
        .map(item => {
          return item.price;
        })
        .reduce((acc, cur) => parseInt(acc, 10) + parseInt(cur, 10), 0);
      setSum(price);
      let stPointsVolSum = calculateTotalWeight(dataTender.startPoints);
      setSumWeight(stPointsVolSum);
    }
  }, [dataTender]);

  useEffect(() => {
    if (dataTender.data.name?.length > 0) {
      setTitle(dataTender.data.name);
    }
    if (dataTender.data.description?.length > 0) {
      setDiscription(dataTender.data.description);
    }
  }, [dataTender.data.name, dataTender.data.description]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <View
        style={[
          Platform.OS === 'android'
            ? {
                flex: 1,
                position: 'relative',
                width: width,
                height: height,
                backgroundColor: '#fff',
                justifyContent: 'flex-end',
              }
            : {
                flex: 1,
                position: 'relative',
                width: width,
                height: height,
                backgroundColor: '#fff',
                justifyContent: 'flex-end',
              },
        ]}>
        <StatusBar translucent barStyle={'dark-content'} />
        <View style={[styles.topBar]}>
          <HeaderTitleComponentNoBg
            customStyle={{paddingTop: safeInsets.top}}
            title={'Ваша доставка'}
            onPress={
              !isOpenList
                ? () => navigation.goBack()
                : () => setIsOpenList(false)
            }
            icon={!isOpenList ? false : true}
          />
        </View>
        <View
          style={[
            Platform.OS === 'android'
              ? {}
              : {height: height / 3 + safeInsets?.top},
            {backgroundColor: '#fff'},
          ]}>
          <MainMap
            mapViewRef={mapViewRef}
            customStyles={
              Platform.OS === 'android'
                ? {height: height / 2 + safeInsets?.top}
                : {height: height / 3 + safeInsets?.top}
            }
            custMap={
              Platform.OS === 'android'
                ? {minHeight: height / 2 + safeInsets?.top}
                : {minHeight: height / 3 + safeInsets?.top}
            }
            customBtnPosition={
              Platform.OS === 'android' ? safeInsets?.top + 25 : safeInsets?.top
            }
            coordinatesArr={coordinates}
            coordinatesFrom={coordinatesFrom}
            coordinatesTo={coordinatesTo}
            isRouteVisible={true}
            onCreateRouteInfo={createRouteInfo}
          />

          <LinearGradient
            colors={[
              'rgba(256, 256, 256, 0.1)',
              'rgba(20, 136, 204, 0.2)',
              'rgba(20, 136, 204, 1)',
            ]}
            style={[
              {
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: 40,
                zIndex: 1000,
                paddingBottom: Platform.OS === 'android' ? 0 : 0,
              },
            ]}
          />
        </View>
        {!isOpenList ? (
          <LinearGradient
            colors={['rgba(20, 136, 204, 0.9)', 'rgba(43, 50, 178, 0.9)']}
            style={[
              styles.bottomWrapper,
              {
                height: height / 2,
                position: 'relative',
              },
            ]}>
            <LinearGradient
              colors={[
                'rgba(20, 136, 204, 0.9)',
                'rgba(20, 136, 204, 0.1)',
                'rgba(20, 136, 204, 0.0)',
              ]}
              style={[
                {
                  position: 'absolute',
                  bottom: 'top',
                  width: '100%',
                  height: 30,
                  zIndex: 1000,
                  paddingBottom: Platform.OS === 'android' ? 0 : 0,
                },
              ]}
            />

            <ScrollView
              ref={scrollref}
              style={[
                {backgroundColor: 'transparent'},
                Platform.OS === 'android' ? {} : {},
              ]}
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingTop: 20,
                paddingBottom: safeInsets?.bottom,
              }}>
              <View
                style={[
                  styles.whiteComponent,
                  mainstyles.shadowPr10,
                  {marginBottom: 20},
                ]}>
                <View
                  style={[
                    styles.titleWrapper,
                    {padding: 0, paddingHorizontal: 0},
                  ]}>
                  <Text style={[mainstyles.text14R, styles.inputCounterStr]}>
                    {title?.length > 0 ? title?.length : 0} | 50
                  </Text>
                  <TextInput
                    ref={titleRef}
                    style={[
                      mainstyles.text14M,
                      styles.textAddress,
                      styles.inputTitle,
                      Platform.OS === 'ios' ? {paddingVertical: 15} : null,
                    ]}
                    placeholder="Краткое описание*"
                    blurOnSubmit={true}
                    placeholderTextColor={THEME.GREY900}
                    value={title}
                    onChangeText={v => handleSaveText('title', v)}
                    maxLength={50}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.whiteComponent,
                  mainstyles.shadowPr10,
                  styles.midWrapperContent,
                ]}>
                <View style={styles.midTopInner}>
                  <View style={styles.leftContainer}>
                    <IconPinSmallOt />
                    <View style={styles.vertLine} />
                    <IconPinSmallFill />
                  </View>

                  <View style={styles.rightContainer}>
                    <View style={[styles.addressItem, mainstyles.botLineGr]}>
                      {dataTender.startPoints.length === 0 ? (
                        <TouchableOpacity
                          onPress={() => onOpenCreatePoint('start')}
                          style={[
                            mainstyles.rowalC,
                            {
                              backgroundColor: 'transparent',
                              width: '82%',
                              height: '100%',
                              justifyContent: 'space-between',
                            },
                          ]}>
                          <Text
                            numberOfLines={2}
                            style={[mainstyles.text14R, styles.textAddress]}>
                            Загрузка
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => onOpenList('start')}
                          style={[
                            mainstyles.rowalC,
                            {
                              backgroundColor: 'transparent',
                              width: '82%',
                              height: '100%',
                              justifyContent: 'space-between',
                            },
                          ]}>
                          {dataTender.startPoints.length === 1 ? (
                            <Text
                              numberOfLines={2}
                              style={[mainstyles.text14R, styles.textAddress]}>
                              {dataTender?.startPoints[0].address}
                            </Text>
                          ) : (
                            <View
                              style={[mainstyles.rowalC, styles.textAddress]}>
                              <Text
                                style={[
                                  mainstyles.text14R,
                                  styles.textAddressWithNum,
                                ]}>
                                {dataTender.startPoints?.length}
                              </Text>
                              {dataTender.startPoints?.length === 1 ? (
                                <Text
                                  numberOfLines={2}
                                  style={[
                                    mainstyles.text14R,
                                    styles.textAddressWithNum,
                                  ]}>
                                  Точка
                                </Text>
                              ) : (
                                <>
                                  {dataTender.startPoints?.length > 1 &&
                                  dataTender.startPoints?.length <= 4 ? (
                                    <Text
                                      numberOfLines={2}
                                      style={[
                                        mainstyles.text14R,
                                        styles.textAddressWithNum,
                                      ]}>
                                      Точки
                                    </Text>
                                  ) : (
                                    <>
                                      {dataTender.startPoints?.length > 4 ? (
                                        <Text
                                          numberOfLines={2}
                                          style={[
                                            mainstyles.text14R,
                                            styles.textAddressWithNum,
                                          ]}>
                                          Точек
                                        </Text>
                                      ) : null}
                                    </>
                                  )}
                                </>
                              )}
                            </View>
                          )}
                          {dataTender.startPoints?.length > 1 ? (
                            <Icon
                              name="dots-three-horizontal"
                              color={THEME.GREY500}
                              size={20}
                              style={{}}
                            />
                          ) : null}
                        </TouchableOpacity>
                      )}
                      <View
                        style={[styles.btnAddressContainer, {width: '18%'}]}>
                        {dataTender.startPoints?.length +
                          dataTender.endPoints?.length <
                          10 && dataTender.startPoints?.length < 9 ? (
                          <BtnIconTrs
                            onPress={() => onOpenCreatePoint('start')}
                            customStyles={{height: 30}}>
                            <Icon
                              name={'plus'}
                              color={THEME.GREY500}
                              size={20}
                            />
                          </BtnIconTrs>
                        ) : null}
                      </View>
                    </View>

                    <View
                      style={[styles.addressItem, styles.addressItemBottom]}>
                      {dataTender.endPoints.length === 0 ? (
                        <TouchableOpacity
                          onPress={() => onOpenCreatePoint('end')}
                          style={[
                            mainstyles.rowalC,
                            {
                              backgroundColor: 'transparent',
                              width: '82%',
                              height: '100%',
                              justifyContent: 'space-between',
                            },
                          ]}>
                          <Text
                            numberOfLines={2}
                            style={[mainstyles.text14R, styles.textAddress]}>
                            Разгрузка
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => onOpenList('end')}
                          style={[
                            mainstyles.rowalC,
                            {
                              backgroundColor: 'transparent',
                              width: '82%',
                              height: '100%',
                              justifyContent: 'space-between',
                            },
                          ]}>
                          {dataTender.endPoints.length === 1 ? (
                            <Text
                              numberOfLines={2}
                              style={[mainstyles.text14R, styles.textAddress]}>
                              {dataTender?.endPoints[0].address}
                            </Text>
                          ) : (
                            <View
                              style={[mainstyles.rowalC, styles.textAddress]}>
                              <Text
                                style={[
                                  mainstyles.text14R,
                                  styles.textAddressWithNum,
                                ]}>
                                {dataTender.endPoints?.length}
                              </Text>
                              {dataTender.endPoints?.length === 1 ? (
                                <Text
                                  numberOfLines={2}
                                  style={[
                                    mainstyles.text14R,
                                    styles.textAddressWithNum,
                                  ]}>
                                  Точка
                                </Text>
                              ) : (
                                <>
                                  {dataTender.endPoints?.length > 1 &&
                                  dataTender.endPoints?.length <= 4 ? (
                                    <Text
                                      numberOfLines={2}
                                      style={[
                                        mainstyles.text14R,
                                        styles.textAddressWithNum,
                                      ]}>
                                      Точки
                                    </Text>
                                  ) : (
                                    <>
                                      {dataTender.endPoints?.length > 4 ? (
                                        <Text
                                          numberOfLines={2}
                                          style={[
                                            mainstyles.text14R,
                                            styles.textAddressWithNum,
                                          ]}>
                                          Точек
                                        </Text>
                                      ) : null}
                                    </>
                                  )}
                                </>
                              )}
                            </View>
                          )}
                          {dataTender.endPoints?.length > 1 ? (
                            <Icon
                              name="dots-three-horizontal"
                              color={THEME.GREY500}
                              size={20}
                              style={{}}
                            />
                          ) : null}
                        </TouchableOpacity>
                      )}
                      <View
                        style={[styles.btnAddressContainer, {width: '18%'}]}>
                        {dataTender.startPoints?.length +
                          dataTender.endPoints?.length <
                          10 && dataTender.endPoints?.length < 9 ? (
                          <BtnIconTrs
                            onPress={() => onOpenCreatePoint('end')}
                            customStyles={{height: 30}}>
                            <Icon
                              name={'plus'}
                              color={THEME.GREY500}
                              size={20}
                            />
                          </BtnIconTrs>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    mainstyles.lineTop,
                    mainstyles.pH20,
                    {paddingBottom: 15},
                  ]}>
                  <View style={[mainstyles.rowalCjcSb, mainstyles.pV5]}>
                    <Text style={[mainstyles.text14M, styles.textAddress]}>
                      Стоимость
                    </Text>
                    <Text style={[mainstyles.text14M, {color: THEME.GREY900}]}>
                      {sum} BYN
                    </Text>
                  </View>
                  <View style={[mainstyles.rowalCjcSb, mainstyles.pV5]}>
                    <Text style={[mainstyles.text14M, styles.textAddress]}>
                      Расстояние:
                    </Text>
                    {routeInfo?.distance && routeInfo.distance?.length > 0 ? (
                      <Text
                        style={[mainstyles.text14M, {color: THEME.GREY900}]}>
                        {routeInfo.distance} км
                      </Text>
                    ) : (
                      <Text
                        style={[mainstyles.text14M, {color: THEME.GREY900}]}>
                        -
                      </Text>
                    )}
                  </View>
                  <View style={[mainstyles.rowalCjcSb, mainstyles.pV5]}>
                    <Text style={[mainstyles.text14M, styles.textAddress]}>
                      Общий вес:
                    </Text>
                    {sumWeight > 0 ? (
                      <Text
                        style={[mainstyles.text14M, {color: THEME.GREY900}]}>
                        {sumWeight} кг
                      </Text>
                    ) : (
                      <Text
                        style={[mainstyles.text14M, {color: THEME.GREY900}]}>
                        -
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.whiteComponent,
                  mainstyles.shadowPr10,
                  styles.titleSection,
                ]}>
                <View style={styles.titleDisct}>
                  <TextInput
                    ref={discrRef}
                    blurOnSubmit={true}
                    style={[
                      mainstyles.text14R,
                      styles.desctInput,
                      Platform.OS === 'ios' ? {minHeight: 120} : null,
                    ]}
                    textAlignVertical="top"
                    placeholder="Уточнения про доставку..."
                    placeholderTextColor={THEME.GREY800}
                    value={description}
                    onFocus={() => {
                      scrollref?.current?.scrollToEnd({animated: true});
                    }}
                    onChangeText={v => handleSaveText('description', v)}
                    multiline={true}
                    numberOfLines={5}
                  />
                </View>
              </View>

              {/* --- ВСТАВЛЕННЫЙ PICKER --- */}
              <View
                style={[
                  styles.whiteComponent,
                  mainstyles.shadowPr10,
                  {marginBottom: 20},
                ]}>
                <Text
                  style={[
                    mainstyles.text14M,
                    {paddingHorizontal: 20, paddingTop: 10},
                  ]}>
                  Тип транспорта
                </Text>
                <Picker
                  selectedValue={transportType}
                  onValueChange={itemValue => setTransportType(itemValue)}
                  style={{marginHorizontal: 15, marginBottom: 10}}>
                  <Picker.Item label="Выберите тип" value="" />
                  <Picker.Item label="Тент" value="tent" />
                  <Picker.Item label="Рефрижератор" value="refrigerator" />
                  <Picker.Item label="Изотерм" value="isotherm" />
                  <Picker.Item label="Бортовой" value="flatbed" />
                  <Picker.Item label="Контейнер" value="container" />
                  <Picker.Item label="Самосвал" value="dump_truck" />
                </Picker>
                {transportType ? (
                  <Text style={{paddingHorizontal: 20, paddingBottom: 10}}>
                    Выбрано: {transportType}
                  </Text>
                ) : null}
              </View>

              <View
                style={[styles.btnRow, {alignSelf: 'center', width: '100%'}]}>
                <View
                  style={[styles.qwe, {width: !isShowReset ? '100%' : '80%'}]}>
                  <DefaultBtnOutline
                    title={'Создать заказ'}
                    disabled={isDisableBtn}
                    onPress={handleCreateTender}
                    customStyles={[styles.btnCustomStyle, {width: '100%'}]}
                  />
                </View>
                {isShowReset ? (
                  <View style={[styles.qwe, {}]}>
                    <TouchableOpacity
                      style={[
                        mainstyles.alCjcC,
                        styles.closeBtn,
                        mainstyles.shadowPr10,
                      ]}
                      onPress={handleOpenAsk}>
                      <Icon name="cross" size={30} color={THEME.GREY500} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </LinearGradient>
        ) : (
          <ListPoints
            point={listPoint}
            data={dataTender}
            onClose={() => setIsOpenList(false)}
            onEdit={handleEditPoint}
            onDelete={handleDeletePoint}
            onChangeIndex={handleChangeIndexPoint}
            nav={'createTender'}
          />
        )}
        {isAskResetVisible ? (
          <View
            style={[
              mainstyles.containerModalGgBl,
              mainstyles.alCjcC,
              {
                paddingTop: safeInsets?.top,
                minHeight: height + safeInsets.top,
                zIndex: 999,
              },
            ]}>
            <InfoAskWindow
              data={findJsonObj(
                jsonDataPrompt,
                'askResetTender',
                askResetTender,
              )}
              onPress={handleResetState}
              onClose={() => setIsAskResetVisible(false)}
            />
          </View>
        ) : null}
        {isLoading ? (
          <View
            style={[
              mainstyles.containerModalGgBl,
              {
                zIndex: 999,
                minHeight: height + safeInsets.top,
                justifyContent: 'center',
                paddingTop: safeInsets.top,
              },
            ]}>
            <ActivityIndicator color={'#fff'} size={'large'} />
          </View>
        ) : null}
        {isSuccessedCreate ? (
          <View
            style={[
              mainstyles.containerModalGgBl,
              mainstyles.alCjcC,
              {
                minHeight: height + safeInsets.top,
                zIndex: 999,
                paddingTop: safeInsets.top,
              },
            ]}>
            <InfoAskWindow
              data={findJsonObj(
                jsonDataPrompt,
                'promptSuccCrTend',
                promptSuccCrTend,
              )}
              onPress={() => handleResetState('nav')}
              onClose={() => handleResetState()}
            />
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: width,
    height: height,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    zIndex: 990,
  },
  whiteComponent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 15,
  },
  bottomWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 999,
  },
  midWrapperContent: {
    marginBottom: 20,
  },
  midTopInner: {
    width: '100%',
    flexDirection: 'row',
  },
  leftContainer: {
    paddingLeft: 23,
    paddingRight: 13,
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vertLine: {
    width: 1.7,
    height: 35,
    backgroundColor: THEME.PRIMARY,
    marginVertical: 6,
  },
  rightContainer: {
    width: '85%',
  },
  addressItem: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    paddingRight: 20,
  },
  addressItemBottom: {
    borderBottomWidth: 0,
  },
  btnAddressContainer: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  textAddress: {
    width: '70%',
    color: THEME.GREY900,
    paddingHorizontal: 5,
  },
  textAddressWithNum: {
    color: THEME.GREY900,
    paddingHorizontal: 5,
  },
  btnRow: {
    width: width - 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btnCustomStyle: {
    height: 45,
    borderRadius: 50,
    shadowColor: THEME.PRIMARY,
    elevation: 20,
  },
  closeBtn: {
    width: 45,
    height: 45,
    borderRadius: 40,
    backgroundColor: '#fff',
    elevation: 10,
    borderWidth: 2,
    borderColor: THEME.PRIMARY,
  },
  titleSection: {
    paddingVertical: 5,
    marginBottom: 20,
    borderRadius: 28,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 20,
  },
  titleDisct: {
    paddingHorizontal: 20,
  },
  inputTitle: {
    padding: 0,
    paddingVertical: 10,
    paddingLeft: 15,
    borderRadius: 28,
    width: '100%',
  },
  desctInput: {
    color: THEME.GREY800,
    alignItems: 'center',
  },
  inputCounterStr: {
    color: THEME.GREY300,
    position: 'absolute',
    top: 12,
    right: 20,
  },
});

export default CreateTenderScreen;
