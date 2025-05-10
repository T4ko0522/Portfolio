"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogTitle } from "src/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Maximize2, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"

// VRChat写真のデータ - 横向き写真
export const landscapePhotos: Photo[] = [
  {
    id: 1,
    title: "昔からの友達との写真！",
    description: "2025-03-06",
    imageUrl: "/images/landscape/VRChat_2025-03-06_02-12-35.839_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 2,
    title: "ちーぬちゃんとのつーしょ！",
    description: "2025-03-04",
    imageUrl: "/images/landscape/VRChat_2025-03-04_07-38-47.587_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 3,
    title: "めちゃちるきぷちゃん",
    description: "2024-12-19",
    imageUrl: "/images/landscape/VRChat_2024-12-19_01-17-00.801_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 4,
    title: "元お砂糖とのおそろこーで！",
    description: "2024-11-30",
    imageUrl: "/images/landscape/VRChat_2024-11-30_00-51-04.308_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 5,
    title: "ちーぬちゃん達とちるちーぬ！",
    description: "2024-11-21",
    imageUrl: "/images/landscape/VRChat_2024-11-21_05-09-53.919_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 6,
    title: "ちーぬちゃんとのツーショ♡",
    description: "2024-11-21",
    imageUrl: "/images/landscape/VRChat_2024-11-21_02-31-52.255_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 7,
    title: "ちーぬちゃんと！",
    description: "2024-11-19",
    imageUrl: "/images/landscape/VRChat_2024-11-19_02-37-49.440_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 8,
    title: "ちーぬちゃんとの初対面！",
    description: "2024-10-30",
    imageUrl: "/images/landscape/VRChat_2024-10-30_23-13-24.262_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 9,
    title: "たくさんのはむすたー！！",
    description: "2024-10-14",
    imageUrl: "/images/landscape/VRChat_2024-10-14_17-09-04.164_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 10,
    title: "きぷでつーしょ！！",
    description: "2024-09-21",
    imageUrl: "/images/landscape/VRChat_2024-09-21_21-44-16.074_3840x2160.png",
    orientation: "landscape" as const,
  },
  {
    id: 11,
    title: "昔からの友達と集合写真！",
    description: "2024-08-17",
    imageUrl: "/images/landscape/VRChat_2024-08-17_00-40-23.124_1920x1080.png",
    orientation: "landscape" as const,
  },
  {
    id: 12,
    title: "なかのいいことごろごろ写真！",
    description: "2024-08-15",
    imageUrl: "/images/landscape/VRChat_2024-08-15_09-16-03.518_1920x1080.png",
    orientation: "landscape" as const,
  },
]

// VRChat写真のデータ - 縦向き写真
export const portraitPhotos = [
  {
    id: 11,
    title: "ちーぬちゃんとのつーしょ！",
    description: "2025-04-11",
    imageUrl: "/images/portrait/VRChat_2025-04-11_18-48-44.095_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 12,
    title: "かわいい僕の写真！",
    description: "2025-03-26",
    imageUrl: "/images/portrait/VRChat_2025-03-26_02-02-49.549_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 13,
    title: "新しい改変記念に！",
    description: "2025-03-25",
    imageUrl: "/images/portrait/VRChat_2025-03-25_15-47-05.193_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 14,
    title: "おしゃれな僕の写真！",
    description: "2025-03-04",
    imageUrl: "/images/portrait/VRChat_2025-03-04_23-54-17.420_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 15,
    title: "じとめな僕の写真！",
    description: "2025-02-20",
    imageUrl: "/images/portrait/VRChat_2025-02-20_08-26-27.293_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 16,
    title: "ねむそうな僕の写真！",
    description: "2025-02-18",
    imageUrl: "/images/portrait/VRChat_2024-12-18_08-29-22.489_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 17,
    title: "おはツイしたときの写真！",
    description: "2024-12-03",
    imageUrl: "/images/portrait/VRChat_2024-12-03_23-05-38.226_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 18,
    title: "黒改変したときの写真！",
    description: "2024-11-24",
    imageUrl: "/images/portrait/VRChat_2024-11-24_19-24-48.261_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 19,
    title: "ちーぬちゃんとのつーしょ！",
    description: "2024-11-19",
    imageUrl: "/images/portrait/VRChat_2024-11-19_02-35-44.673_1080x1920.png",
    orientation: "portrait" as const,
  },
  {
    id: 20,
    title: "別げーの友達とのつーしょ！",
    description: "2024-09-02",
    imageUrl: "/images/portrait/VRChat_2024-09-02_21-04-22.513_2160x3840.png",
    orientation: "portrait" as const,
  },
]

// 全ての写真を結合
const allPhotos = [...landscapePhotos, ...portraitPhotos]

export default function VRChatGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof allPhotos)[0] | null>(null)
  const [activeTab, setActiveTab] = useState<string>("landscape")

  // 表示する写真を選択
  const getDisplayPhotos = () => {
    switch (activeTab) {
      case "landscape":
        return landscapePhotos
      case "portrait":
        return portraitPhotos
      default:
        return landscapePhotos
    }
  }

  const displayPhotos = getDisplayPhotos()

  return (
    <>
      <Tabs defaultValue="landscape" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger
            value="landscape"
            className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
          >
            <ImageIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">Landscape</span>
          </TabsTrigger>
          <TabsTrigger
            value="portrait"
            className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
          >
            <ImageIcon className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">Portrait</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landscape" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landscapePhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onClick={() => setSelectedPhoto(photo)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portrait" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portraitPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onClick={() => setSelectedPhoto(photo)} isPortrait />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 写真拡大表示用のダイアログ */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl bg-gray-900 border-gray-800">
          {selectedPhoto && (
            <div className="p-1">
              <DialogTitle className="text-white text-2xl font-bold mb-4">
                {selectedPhoto.title}
              </DialogTitle>
              <div
                className={`relative w-full ${selectedPhoto.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"}`}
              >
                <Image
                  src={selectedPhoto.imageUrl || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-contain rounded-md"
                  priority
                />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-white">{selectedPhoto.title}</h3>
                <p className="text-gray-400 mt-1">{selectedPhoto.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* 推し紹介！ */}
      <h4 className="text-lg font-medium text-purple-300 mb-3">✨ ぼくの推し！！</h4>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <img
            src="/images/VRChat_2025-03-11_08-28-23.036_1080x1920.png"
            alt="推しのちーぬちゃん！"
            className="rounded-lg w-full h-auto object-cover shadow-lg shadow-purple-500/20 border border-purple-500/30"
          />
        </div>
        <div className="md:w-2/3">
            <p className="text-gray-300 text-sm">
            ぼくの推しのちーぬちゃん！！！<br />
            声も性格も全部かわいい！！ 人生の癒し！だいすき！ ; - ; <br />
            <br />
            もしよかったら！いや、絶対！見てみて！！！！ <br />
            Twitter : <a href="https://twitter.com/dahukokko_H" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">@dahukokko_H</a><br />
            YouTube : <a href="https://www.youtube.com/@chinu_ch" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">ちーぬちゃんねる</a><br />
            </p>
        </div>
      </div>
    </>
  )
}

// 写真カードコンポーネント
type Photo = {
  id: number
  title: string
  description: string
  imageUrl: string
  orientation: "landscape" | "portrait"
}

type PhotoCardProps = {
  photo: Photo
  onClick: () => void
  isPortrait?: boolean
}

function PhotoCard({ photo, onClick, isPortrait = false }: PhotoCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="overflow-hidden bg-gray-900 border-gray-700 cursor-pointer group">
        <div className={`${isPortrait ? "aspect-[9/16]" : "aspect-video"} relative`} onClick={onClick}>
          <div className="w-full h-full relative">
            <Image
              src={photo.imageUrl || "/placeholder.svg"}
              alt={photo.title}
              fill
              sizes={
                isPortrait
                  ? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={photo.id <= 6}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div>
              <h4 className="text-white font-medium">{photo.title}</h4>
              <p className="text-gray-300 text-sm line-clamp-2">{photo.description}</p>
            </div>
            <Maximize2 className="absolute bottom-4 right-4 w-5 h-5 text-white opacity-70" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
