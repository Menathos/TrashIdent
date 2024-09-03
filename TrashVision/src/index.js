import { View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const DetectObject = () => {

    const [imageUri, setImageUri] = useState(null);
    const [labels, setLabels] = useState([]);
    var resLbl = "No Results";

    //FUNCTION TO SELECT IMAGE FROM LIBRARY
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowEditing: true,
                aspect: [4,3],
                quality: 1,
            })

            if (!result.canceled){
                setImageUri(result.assets[0].uri);
            }
            console.log(result);
        } catch (error){
            console.error('Error picking Image: ', error);
        }
    };

    //FUNCTION TO SEND CHOSEN IMAGE DATA TO GOOGLE VISION API FOR ANALYSIS
    const analyzeImage = async () => {
        try {
            if (!imageUri){
                alert('Please select an image first!');
                return;
            }

            const apiKey = "AIzaSyAmWrp8Pu37tvG-6BKQNgR54KdEyh1vjPI";
            const apiURL = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;
            // console.log(apiURL);
            //
            const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
                requests: [
                    {
                        image: {
                            content: base64ImageData,
                        },
                        features: [{type: 'LABEL_DETECTION', maxResults: 20}],
                    },
                ],
            };
            
            const apiResponse = await axios.post(apiURL, requestData)
            // setLabels(apiResponse.data.responses[0].labelAnnotations);
            // THIS LINE IS TO CHECK THE RESPONSE FROM GOOGLE VISION
            // console.log(apiResponse.data.responses[0].labelAnnotations[1].description);

            //CALL FUNCTION checkMat TO IDENTIFY MATERIAL BASED ON RESULTS FROM GOOGLE VISION
            var res = checkMat(apiResponse);
            resLbl = res;
            console.log("res: ", res);

        } catch (error){
            console.error('Error analyzing image: ', error);
            alert('Error analyzing image. Please try again');
        }
    };
    
    //THIS FUNCTION IS TO ANALYZE THE RESULT FROM GOOGLE VISION API AND IDENTIFY THE MATERIAL OF THE OBJECT
    const checkMat = (apiData) => {
        // console.log(apiData.data.responses[0].labelAnnotations[0].description);
        var cnt=0;
        var res=0;
        var fnd = false;
        var descp;
        do {

            // console.log("res: ", res);
            // console.log("fnd: ", fnd);
            // console.log("descp: ", descp);
            if(apiData.data.responses[0].labelAnnotations[cnt].description=="Plastic"){
                res = 1;
                fnd = true;
                descp = apiData.data.responses[0].labelAnnotations[cnt].description;
            }
            else if(apiData.data.responses[0].labelAnnotations[cnt].description=="Metal"){
                res = 2;
                fnd = true;
                descp = apiData.data.responses[0].labelAnnotations[cnt].description;
            }else{
                res = 3;
                descp = "NOT FOUND";   
            }
            if(fnd){
                break;
            }
            console.log(apiData.data.responses[0].labelAnnotations[cnt].description);
            console.log("cnt: ", cnt, " res: ", res, " fnd" , fnd, " desc: ", descp);
            cnt++;
        }while(cnt<19);
        setLabels(apiData.data.responses[0].labelAnnotations[cnt]);
        return descp;
    };

    //THIS IS THE UI OF THE APPLICATION
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Google Cloud Vision API Demo
            </Text>
            {imageUri && (
                <Image 
                    source={{uri: imageUri}}
                    style={{width: 300, height: 300}}
                />
            )}
            <TouchableOpacity
                onPress={pickImage}
                style={styles.button}
            >
                <Text style={styles.text}>Choose an Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={analyzeImage}
                style={styles.button}
            >
                <Text style={styles.text}>Analyze Image</Text>
            </TouchableOpacity>
            {
                labels.length > 0 && (
                    <View>
                        <Text style={styles.label}>
                            Labels: 
                        </Text>
                        {/* <Text>
                            {resLbl}
                        </Text>
                         */}
                        {
                            labels.map((label) => (
                                <Text
                                    key={label.mid}
                                    style={styles.outputtext}
                                >
                                    {label.description}
                                </Text>
                            ))
                        }
                    </View>
                )
            }
        </View>
    )
}

export default DetectObject

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 50,
        marginTop: 100,
    },
    button: {
        backgroundColor: '#DDDDDD',
        padding: 10,
        marginBottom: 10,
        marginTop: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    outputtext: {
        fontSize: 18,
        marginBottom: 10,

    }
  });