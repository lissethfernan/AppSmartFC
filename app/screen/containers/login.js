import React,{Component} from 'react';
import {NavigationActions} from 'react-navigation';
import {Modal, StyleSheet, Text,BackHandler, View,  Image, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {connect} from 'react-redux';
import * as SQLite from 'expo-sqlite';
//import Header from '../../components/header';
import HeaderLogin from '../../components/headerLogin';
import API from '../../../utils/api';
const db = SQLite.openDatabase("db5.db");

function goodBye(){
  BackHandler.exitApp();
}

class Login extends Component {
  
  static navigationOptions =({navigation})=>{
    return{
      header: <HeaderLogin></HeaderLogin>,
    }
  }

  state={
    email: null,
    password: null,
    storage: null,
    modalVisible: false,
    ipconfig: null
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  async signIn(data){
    db.transaction(tx => {
      tx.executeSql("select * from students", [], (_, { rows:{ _array } }) =>
        this.setState({ storage: _array })
        //console.log(this.state.storage)
      );
    });
    dataStudents= this.state.storage;
    console.log("Filtro");
    var dataCompleted =null;
    console.log(dataStudents.length);
    
    if(dataStudents.length==0){
    }else{
      
      for (var i = 0; i<=dataStudents.length-1;i++){
        
        //Cambio para entrar sin tener que poner la contraseña
        //if (dataStudents[i].correo_electronico == this.state.email){
          if (dataStudents[i].correo_electronico == 'estudiante10@fc.com'){
          console.log("Entro")
          
          //if(dataStudents[i].contrasena == this.state.password){
            if(dataStudents[i].contrasena == '1234'){
            dataCompleted = dataStudents[i];
          }else{
            
            Alert.alert(
              'Datos Incorrectos',
              'La contraseña o email son incorrectos',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ],
              { cancelable: false }
            );
          }
        }
      }      
    }
    console.log(dataCompleted);
    
    if(dataCompleted!= null){
      this.props.dispatch({
        type: 'SET_STUDENT',
        payload: {
          student: dataCompleted,
        }
      })

      this.props.dispatch(NavigationActions.navigate({
        routeName: 'Activities'
      }))
    }else{
      
      Alert.alert(
        'Datos Incorrectos',
        'La contraseña o email son incorrectos',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false }
      );
    }
    console.log("Filtro Final");
  }
  componentDidMount(){
    //Aqui Hay un cambio si se aprueba 
    
    this.props.dispatch({
      type: 'SET_STUDENT',
      payload: {
        student: null,
      }
    })

    db.transaction(tx => {
      tx.executeSql(
        "create table if not exists students (id_estudiante integer not null unique, tipo_usuario integer, nombre_estudiante text, apellido_estudiante text, grado_estudiante int, curso_estudiante int, id_colegio int, nombre_usuario text, contrasena text, correo_electronico text);"
      );
      tx.executeSql("select * from students", [], (_, { rows:{ _array } }) =>
              this.setState({ storage: _array }),
          );
      });
  }

  registrateForm(){
    this.props.dispatch(NavigationActions.navigate({
      routeName: 'Registro'
  }))
  }
  
  async registrateIP(){
    ipConfigSend = this.state.ipconfig;
    console.log(ipConfigSend);
    var answer = 0;
    answer = await API.getConection(ipConfigSend);
    console.log(answer);
    if(answer==1){
      console.log("Hace Ping")
      this.props.dispatch({
        type: 'SET_IPCONFIG',
        payload: {
          ipconfig: ipConfigSend,
        }
      })

      Alert.alert(
        'Conexión',
        'La conexión con el servidor fue exitosa.',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false }
    );

    this.setModalVisible(!this.state.modalVisible);
    }else{

      Alert.alert(
        'Conexión',
        'La conexión con el servidor es erronea por favor verifica tu IP',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false }
      );
    } 
  }

  async sincronizarDatas(){
    const query = await API.allStudent(this.props.ipconfig);
    //console.log(query)
    console.log("Entrando al Sistema de Sincronizacion");

    for (var i = 0; i<query.length; i++){
      var id_estudiante = query[i].id_estudiante;
      var id_colegio= query[i].id_colegio;
      var nombre_estudiante= query[i].nombre_estudiante;
      var nombre_usuario = query[i].nombre_usuario;
      var tipo_usuario = query[i].tipo_usuario;
      var grado_estudiante = query[i].grado_estudiante;
      var curso_estudiante = query[i].curso_estudiante;
      var apellido_estudiante = query[i].apellido_estudiante;
      var contrasena = query[i].contrasena;
      var correo_electronico = query[i].correo_electronico;
      console.log("Datos User");
      console.log(id_estudiante);
      console.log(nombre_estudiante);
      console.log(apellido_estudiante);
      this.envioDatosSQL(id_estudiante,id_colegio,nombre_estudiante,nombre_usuario,tipo_usuario,grado_estudiante,curso_estudiante,apellido_estudiante,contrasena,correo_electronico);
    }
    
    Alert.alert(
      'Sincronización',
      'La sincronización de los usuarios fue realizada',
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false }
    );
  }

  envioDatosSQL(id_estudiante,id_colegio,nombre_estudiante,nombre_usuario,tipo_usuario,grado_estudiante,curso_estudiante,apellido_estudiante,contrasena,correo_electronico){
    db.transaction(
      tx => {
        tx.executeSql("insert into students (id_estudiante, tipo_usuario, nombre_estudiante, apellido_estudiante, grado_estudiante, curso_estudiante, id_colegio, nombre_usuario, contrasena, correo_electronico) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_estudiante, tipo_usuario,nombre_estudiante,apellido_estudiante,grado_estudiante, curso_estudiante, id_colegio, nombre_usuario, contrasena, correo_electronico]);
        tx.executeSql("select * from students", [], (_, { rows: { _array } }) =>
          console.log(_array)
        );
      },
      null,
      this.consulta()
    );
  }

  consulta(){
    db.transaction(tx => {
      tx.executeSql("select * from students", [], (_, { rows:{ _array } }) =>
        this.setState({ storage: _array }),
        console.log(this.state.storage)
      );
    });
  }

  async loginAdmin(){
    var data = {
      nombre_usuario:this.state.email,
	    contrasena: this.state.password
    }
    const query = await API.loginAdmin(this.props.ipconfig, data);
    console.log(query);
    if(query.length==1){
      this.props.dispatch(NavigationActions.navigate({
        routeName: 'Admin'
      }))
    }else{
      console.log("Pailas")
    }
  }
  render() {
      return (
        <View style={styles.container}>
          <Image
            style={{width: 300, height: 300}}
            source={require('../../../assets/images/LogoSinFondo.png')}
          />
          
          <TextInput style={styles.email} placeholder='Correo electrónico'
          autoCapitalize='none'
          onChangeText={(text) => this.setState({email: text})}
          >
          </TextInput>
          <TextInput style={styles.password} placeholder='Contraseña'
          secureTextEntry={true} 
          onChangeText={(text) => this.setState({password: text})}

          >
          </TextInput>

          <TouchableOpacity style={styles.touchableButtonSignIn} onPress={()=>this.signIn()}>
              <Text style={styles.textButton}>
                INICIAR SESIÓN
              </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.touchableButtonSignIn} onPress={()=>this.sincronizarDatas()}>
              <Text style={styles.textButton}>
                SINCRONIZA DATOS
              </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.touchableButtonSignIn} onPress={()=>this.loginAdmin()}>
              <Text style={styles.textButton}>
                LOGIN COMO ADMIN
              </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={()=>this.registrateForm()} style={styles.registrate}>
            <Text> No tienes una Cuenta? </Text><Text style={{color:"#70C2E5"}}>Registrate</Text>
          </TouchableOpacity>

          <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{ marginTop: 22, marginLeft: 20}}>
            <View >

              <Text style={{ fontWeight:'bold', fontSize: 17}}>Conecta tu IP:</Text>

              <TextInput style={styles.ip} placeholder='Introduce tu IP'
                  autoCapitalize='none'
                  onChangeText={(text) => this.setState({ ipconfig: text })}
              ></TextInput>

                <TouchableOpacity style={styles.touchableButtonSignIn} onPress={() => this.registrateIP()}>
                    <Text style={styles.textButton2}>
                      GUARDAR IP
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.touchableButtonSignIn} onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                    <Text style={styles.textButton2}>
                      CANCELAR
                    </Text>
                </TouchableOpacity>

                <Text style={styles.textDocument}>Recuerde que se requitere estar conectado con el servicio, en caso de no estar conectado dirijase a su director o al docente para que se le proporcione la conexión; tambien recuerde que en la aplicación puedes acceder a contenido adicional de manera de invitado.</Text>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <Text style={{color:"#424B5B", marginTop: 15}}>Conecta tu IP</Text>
        </TouchableOpacity>
        </View>
      );
    }
  }
  const styles = StyleSheet.create({
    textDocument:{
      color: '#424B5B',
      textAlign: 'justify',
      marginTop: 30,
      marginRight:30,
      marginBottom:20,
    },
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
      justifyContent: 'center'
    },
    textInit:{
      marginTop: 30,
      fontSize: 20,
      fontWeight: "bold",
      color: '#E7E7E7'
    },
    email:{
      marginTop: 25,
      borderRadius:15,
      color: '#000000',
      textAlign: "center",
      height: 40,
      width: 300,
      backgroundColor: '#FFF'
      
    },
    ip:{
      marginTop: 25,
      borderRadius:15,
      color: '#000000',
      textAlign: "center",
      height: 40,
      width: 300,
      backgroundColor: '#F5F5F5'
    },
    password:{
      marginTop: 25,
      marginBottom:25,
      borderRadius:15,
      color: '#000000',
      textAlign: "center",
      height: 40,
      width: 300,
      backgroundColor: '#FFFFFF'
    },
    buttonSignIn:{
      borderRadius:17,
      height: 40,
      width: 300,
      backgroundColor: '#5DC5E6',
      textAlign:'center',
      marginTop:20
    },
    textButton:{
      padding: 10,
      backgroundColor: '#424B5B',
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 15, 
      color: '#F5F5F5'
    },
    textButton2:{
      padding: 10,
      backgroundColor: '#424B5B',
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 15, 
      color: '#F5F5F5',    
      alignItems: 'center',
      height: 40, 
      marginTop: 15, 
      marginRight: 150
    },
    touchableButtonSignIn:{
      justifyContent: 'center',
    },
    registrate:{
      color:"#424B5B", 
      marginTop: 15
    }
  });
  function mapStateToProps(state){
    return{
        ipconfig: state.videos.selectedIPConfig
    }
  }
  
  export default connect (mapStateToProps)(Login);
