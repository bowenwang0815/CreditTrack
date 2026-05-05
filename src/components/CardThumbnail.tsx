import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cardImageMap } from "../assets/cards";
import { TrackerCard } from "../types";

function normalizeToken(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferLegacyImageKey(card: TrackerCard) {
  const issuer = normalizeToken(card.issuer);
  const name = normalizeToken(card.name);

  if (issuer === "american express" && name === "gold card") {
    return "amex-gold";
  }

  if (issuer === "american express" && name === "platinum card") {
    return "amex-platinum";
  }

  if (issuer === "bank of america" && name.includes("customized cash")) {
    return "bank-of-america-customized-cash";
  }

  if (issuer === "bank of america" && name.includes("unlimited cash")) {
    return "bank-of-america-unlimited-cash";
  }

  if (issuer === "capital one" && name === "venture x") {
    return "capital-one-venture-x";
  }

  if (issuer === "capital one" && name.includes("venture rewards")) {
    return "capital-one-venture";
  }

  if (issuer === "capital one" && name === "savor") {
    return "capital-one-savor";
  }

  if (issuer === "chase" && name === "freedom flex") {
    return "chase-freedom-flex";
  }

  if (issuer === "chase" && name === "freedom unlimited") {
    return "chase-freedom-unlimited";
  }

  if (issuer === "chase" && name === "sapphire preferred") {
    return "chase-sapphire-preferred";
  }

  if (issuer === "chase" && name === "sapphire reserve") {
    return "chase-sapphire-reserve";
  }

  return undefined;
}

export function resolveCardImageSource(card: TrackerCard): ImageSourcePropType | undefined {
  const resolvedImageKey =
    (card.imageAssetKey && cardImageMap[card.imageAssetKey] ? card.imageAssetKey : undefined) ??
    inferLegacyImageKey(card);

  if (resolvedImageKey) {
    return cardImageMap[resolvedImageKey];
  }

  if (card.imageUrl) {
    return { uri: card.imageUrl };
  }

  return undefined;
}

export function CardThumbnail({
  card,
  compact = false
}: {
  card: TrackerCard;
  compact?: boolean;
}) {
  const imageSource = resolveCardImageSource(card);

  return (
    <View
      style={[
        styles.container,
        compact ? styles.containerCompact : styles.containerRegular,
        imageSource
          ? styles.containerWithImage
          : [styles.containerFallback, { backgroundColor: card.colorHex }]
      ]}
    >
      {imageSource ? (
        <Image
          resizeMode="cover"
          source={imageSource}
          style={styles.cardImage}
        />
      ) : (
        <>
          <LinearGradient
            colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)", "rgba(0,0,0,0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.fallbackContent}>
            <Text style={styles.issuer}>{card.issuer.toUpperCase()}</Text>
            <Text style={styles.digits}>{card.last4 ? `•••• ${card.last4}` : "CARD"}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    overflow: "hidden"
  },
  containerFallback: {
    // padding is moved to fallbackContent to allow absoluteFill gradient to cover full area
  },
  fallbackContent: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between"
  },
  containerRegular: {
    width: 108,
    height: 68,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  containerCompact: {
    width: 90,
    height: 58,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  containerWithImage: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF5"
  },
  cardImage: {
    width: "100%",
    height: "100%"
  },
  issuer: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  digits: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  }
});
