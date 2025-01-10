/*
2024-12-30 22:35:29

album 받아오기를 어떻게 할 것 인가..
1. tanstack 으로 백그라운드 처리
2. 별도의 페이지로 이동한 후, 앨범 하나씩 insert action 처리

어떤 방법이 어울릴까..
1. tanstack 으로 백그라운드 처리하기로 결정한다. 일 더 만들지 말고 빠르게 가자.

album API URL:
https://musicbrainz.org/ws/2/release?artist=b7442f18-d9be-4185-8b51-482510046156&fmt=json

그리고, album 의 id 로 api 에 쿼리하는 tracks API URL:
https://musicbrainz.org/ws/2/release/aaf6b030-049a-48e4-a636-6039f0d32a99?inc=recordings&fmt=json

*/

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Pressable } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import { AlbumType, ArtistType } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TagType } from "@/types/tagType";
import Tags from "./_components/Tags";
import { useColorScheme } from "nativewind";
import { getColors } from "@/constants/color";

type DBArtistCardProps = {
  artist: ArtistType;
  deleteArtist: (id: string) => void;
};
type DBAlbumCountType = {
  albumsCnt: number;
};

export default function DBArtistCard({
  artist,
  deleteArtist,
}: DBArtistCardProps) {
  const db = useSQLiteContext();
  const [albumsCnt, setAlbumsCnt] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]); // 태그 상태 추가
  const { colorScheme } = useColorScheme();
  const currentColors = getColors(colorScheme as "light" | "dark");

  // 현재 artist 의 앨범 count 를 가져온다.
  useEffect(() => {
    const getAlbumsCount = async () => {
      try {
        const row = await db.getFirstAsync(
          `SELECT COUNT(*) AS albumsCnt FROM releases WHERE artist_id = ?`,
          [artist.id]
        );
        row && setAlbumsCnt((row as DBAlbumCountType).albumsCnt);
      } catch (error) {
        console.error("Error getting albums count:", error);
      }
    };
    getAlbumsCount();
    const getArtistTags = async (artistId: string) => {
      try {
        const result = await db.getAllAsync<TagType>(
          `SELECT name FROM tags WHERE id IN (SELECT tag_id FROM artist_tags WHERE artist_id = ?)`,
          [artistId]
        );
        setTags(result.map((row) => row.name)); // 태그 배열로 변환하여 저장
        console.log("tags:", tags);
        console.log("tags....");
      } catch (error) {
        console.error("Error getting tags:", error);
      }
    };
    getArtistTags(artist.id);
  }, [artist.id]);

  return (
    <Card className="w-full max-w-md mx-auto my-4 ">
      <CardHeader className="pb-2 bg-background">
        <View className="flex flex-row justify-between">
          <CardTitle className="text-2xl font-extrabold text-foreground">
            <Link className="mx-6" href={`../../artists/${artist.id}`}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={24}
                color={"#295491"}
              />
              {artist.name}
            </Link>
          </CardTitle>
          {artist.score !== undefined ? (
            <View className="flex items-center space-x-1">
              <Text className="text-sm font-medium">Score:</Text>
              <Text className="text-lg font-bold">{artist.score}</Text>
              <Text className="text-xs text-muted-foreground">/100</Text>
            </View>
          ) : null}
        </View>
        {artist.sort_name && artist.sort_name !== artist.name ? (
          <Text className="text-sm text-muted-foreground">
            {artist.sort_name}
          </Text>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        {artist.type ? (
          <View className="flex flex-row items-center gap-2">
            <Ionicons name="people-outline" size={18} color={"#64748b"} />
            <Text className="text-lg text-slate-500">{artist.type}</Text>
          </View>
        ) : null}
        {artist.country ? (
          <View className="flex flex-row items-center gap-2">
            <Ionicons name="flag-outline" size={18} color={"#64748b"} />
            <Text className="text-lg text-slate-500">{artist.country}</Text>
          </View>
        ) : null}
        {artist.begin_date || artist.end_date ? (
          <View className="flex items-left space-x-2">
            {/* <CalendarIcon className="h-4 w-4 text-muted-foreground" /> */}
            <Text className="text-sm">
              {artist.begin_date || "Unknown"} - {artist.end_date || "Present"}
            </Text>
          </View>
        ) : null}
        {artist.albumsCnt ? (
          <View className="flex flex-row justify-between">
            <View className="flex flex-row items-center gap-2">
              <Ionicons
                name="musical-note-outline"
                size={18}
                color={"#64748b"}
              />
              <Text className="text-sm">Albums: {artist.albumsCnt}</Text>
            </View>
            <Text className="text-sm">To Albums</Text>
          </View>
        ) : (
          <View className="flex flex-row justify-between ">
            <View className="flex flex-row items-center gap-2">
              <Ionicons
                name="musical-note-outline"
                size={18}
                color={"#64748b"}
              />
              <Text className="text-lg text-slate-500">
                Albums: {artist.albumsCnt ? artist.albumsCnt : 0}
              </Text>
            </View>
          </View>
        )}
        {artist.disambiguation ? (
          <View className="flex flex-row items-center gap-2">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={"#295491"}
            />
            <Text className="text-base text-muted-foreground">
              {artist.disambiguation}
            </Text>
          </View>
        ) : null}
        {tags && tags.length > 0 ? <Tags tags={tags} /> : null}
        <View className="flex flex-row justify-between items-left">
          <Badge variant="secondary" className="w-fit">
            <Text>ID: {artist.id}</Text>
          </Badge>
          <Pressable
            className="px-3 py-2 border rounded-md"
            onPress={() => deleteArtist(artist.id)}
          >
            <Ionicons name="trash-outline" size={20} color={"#295491"} />
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}
