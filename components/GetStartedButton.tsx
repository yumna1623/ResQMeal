import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

interface GetStartedButtonProps {
  onPress: () => void;
  buttonText: string;
}

const GetStartedButton: React.FC<GetStartedButtonProps> = ({
  onPress,
  buttonText,
}) => {
  const buttonRef = useRef<any>(null);

  const handlePress = () => {
    if (buttonRef.current) {
      buttonRef.current.zoomIn(400);
    }
    onPress();
  };

  return (
    /* Essential: width 100% on the wrapper so it doesn't collapse */
    <Animatable.View ref={buttonRef} style={{ width: "100%" }}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#568056",
    paddingVertical: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Fill the Animatable.View
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default GetStartedButton;
