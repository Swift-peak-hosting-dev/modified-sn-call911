"use strict";

// src/utils/notification.ts
function createNotification(options) {
  SetNotificationTextEntry("STRING");
  AddTextComponentString(options.message);
  SetNotificationMessage(
    options.picture,
    options.picture,
    true,
    options.icon ?? 0 /* None */,
    options.title,
    options.subject ?? ""
  );
}

// integrations/call911/client/client.ts
emit("chat:addSuggestion", `/${"call911" /* Call911 */}`, "Contact the emergency services.", [
  { name: "description", help: "The description of the call" }
]);
onNet("sn:911Call" /* Call911ToClient */, ({ source, name, description }) => {
  const playerPed = GetPlayerPed(-1);
  const [x, y, z] = GetEntityCoords(playerPed, true);
  const [lastStreet] = GetStreetNameAtCoord(x, y, z);
  const lastStreetName = GetStreetNameFromHashKey(lastStreet);
  const heading = GetEntityHeading(PlayerPedId());
  setImmediate(() => {
    emitNet("sn:911CallUpdate" /* Call911ToServer */, {
      street: lastStreetName,
      name,
      description,
      position: { x, y, z, heading },
      source
    });
  });
});
onNet("sn:911CallResponse" /* Call911ToClientResponse */, (state) => {
  if (state === "success") {
    createNotification({
      picture: "CHAR_CALL911" /* CHAR_CALL911 */,
      icon: 1 /* ChatBox */,
      message: "Your call has been reported to the emergency services",
      title: "Emergency Services"
    });
  } else {
    createNotification({
      picture: "CHAR_CALL911" /* CHAR_CALL911 */,
      icon: 1 /* ChatBox */,
      message: "We were unable to process your 911 call at this time.",
      title: "Failed to report call"
    });
  }
});
