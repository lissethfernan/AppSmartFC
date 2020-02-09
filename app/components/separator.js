import React from 'react';
import {View,Text, StyleSheet} from 'react-native';

/** @function VerticalSeparator */
// Create the specific elements for separate content. 

function VerticalSeparator (props){
    return(
        <View >
            <View><Text> </Text></View>
            <View style={[styles.separator, {borderTopColor:(props.color)?props.color: '#eaeaea'}]}></View>
            <View><Text> </Text></View>
        </View>
    )
}
const styles = StyleSheet.create({
    separator:{
        borderTopWidth:1,
    }
})

export default VerticalSeparator;