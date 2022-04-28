import React, { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform, View, Button } from "react-native";
import * as Notification from "expo-notifications";

Notification.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        };
    },
});

export default function App() {
    const [notificationToken, setNotificationToken] = useState();

    useEffect(async () => {
        const { status: existingStatus } =
            await Notification.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notification.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }
        const token = (await Notification.getExpoPushTokenAsync()).data;
        setNotificationToken(token);
        if (Platform.OS === "android") {
            Notification.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notification.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }
    }, []);

    useEffect(() => {
        const backgroundSubscription =
            Notification.addNotificationResponseReceivedListener((response) => {
                console.log(response);
            });

        const foregroundSubscription =
            Notification.addNotificationReceivedListener((notification) => {
                console.log(notification);
            });

        return () => {
            backgroundSubscription.remove();
            foregroundSubscription.remove();
        };
    }, []);

    const triggerNotificationHandler = () => {
        //local notification
        // console.log("pressed");
        // Notification.scheduleNotificationAsync({
        //     content: {
        //         title: "My First Local Notification",
        //         body: "This is the first local notification we are sending",
        //         color: "red",
        //         sound: " ",
        //     },
        //     trigger: {
        //         seconds: 10,
        //     },
        // });

        fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-Encoding": "gzip, geflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: notificationToken,
                data: { extraData: "some-data" },
                title: "sent via the app",
                body: "this push nothification was sent via the app!",
            }),
        });
    };

    return (
        <View style={styles.container}>
            <Button
                title="Trigger Notification"
                onPress={triggerNotificationHandler}
            />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
