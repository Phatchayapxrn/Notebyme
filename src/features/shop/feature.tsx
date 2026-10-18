// =====================================================================
// feature.tsx (shop) : ข้อมูลของระบบ "ร้านค้า" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { Store } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { ShopPage } from './pages/ShopPage'
import { ShopHomeCard } from './parts/ShopHomeCard'
import { bringShopItemBack, deleteShopItemForever, getAllShopDataForBackup, getShopTrashItems } from './database'

export const shopFeature: AppFeature = {
  id: 'shop',
  menuName: 'ร้าน',
  menuIcon: Store,
  mainPath: '/shop',
  menuOrder: 5,
  pages: [{ path: '/shop', element: <ShopPage /> }],
  homeCard: ShopHomeCard,
  trashActions: {
    kindName: 'ร้าน',
    kindEmoji: '🏪',
    getTrashItems: getShopTrashItems,
    bringBackFromTrash: bringShopItemBack,
    deleteForever: deleteShopItemForever,
  },
  getBackupData: getAllShopDataForBackup,
}