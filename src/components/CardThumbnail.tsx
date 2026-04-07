import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
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
          <Text style={styles.issuer}>{card.issuer.toUpperCase()}</Text>
          <Text style={styles.digits}>{card.last4 ? `•••• ${card.last4}` : "CARD"}</Text>
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
    padding: 8
  },
  containerRegular: {
    width: 108,
    height: 68,
    borderRadius: 12
  },
  containerCompact: {
    width: 90,
    height: 58,
    borderRadius: 10
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
    color: "#FFFFFFCC",
    fontSize: 9,
    fontWeight: "700"
  },
  digits: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  }
});
