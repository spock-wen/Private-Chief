<template>
  <div v-if="table" class="max-w-7xl mx-auto py-12 px-4 space-y-10 animate-fade-in-up">
    <!-- Breadcrumbs & Status -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <button @click="router.back()" class="p-2 -ml-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
            <ArrowLeftIcon :size="20" />
          </button>
          <nav class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
            <router-link :to="isHost ? '/host/tables' : '/'" class="hover:text-primary transition-colors">
              {{ isHost ? '我的饭桌' : '首页' }}
            </router-link>
            <span>/</span>
            <span class="text-primary">详情</span>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <h1 class="serif-title text-4xl font-bold text-text-dark">{{ table.name }}</h1>
          <span :class="[
            'px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-500 shadow-sm',
            statusConfig[table.status].class
          ]">
            {{ statusConfig[table.status].label }}
          </span>
        </div>
        <p class="text-text-muted text-sm flex items-center gap-4 italic">
          <span class="flex items-center gap-1.5"><CalendarIcon :size="14" /> {{ formatDate(table.time) }}</span>
          <span class="flex items-center gap-1.5"><MapPinIcon :size="14" /> {{ table.location || '翠微居' }}</span>
        </p>
      </div>

      <!-- Popularity Spotlight Banner -->
      <div v-if="table.status === 'VOTING' && allTimeTopDishes.length > 0" class="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/30 to-primary/10 rounded-custom p-6 border border-primary/10 flex flex-col md:flex-row items-center gap-6 shadow-warm">
        <!-- Shimmer Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none"></div>
        
        <div class="relative z-10 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-bounce">
            <TrophyIcon :size="24" />
          </div>
          <div>
            <h3 class="serif-title text-lg font-bold text-text-dark">人气风向标</h3>
            <p class="text-xs text-text-muted">当前全场最受期待的前三佳肴</p>
          </div>
        </div>
        <div class="flex-1 flex flex-wrap gap-4">
          <div v-for="(dish, index) in allTimeTopDishes" :key="dish.id" class="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-custom border border-primary/10 shadow-sm hover:scale-105 transition-transform duration-300">
            <span class="text-xl font-black italic" :class="index === 0 ? 'text-primary' : 'text-text-muted'">#{{ index + 1 }}</span>
            <img :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" class="w-8 h-8 rounded-full object-cover border-2 border-primary/20" />
            <span class="text-sm font-bold text-text-dark">{{ dish.name }}</span>
            <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{{ getVoteCount(dish.id) }} 票</span>
          </div>
        </div>
      </div>

      <!-- Host Control Panel -->
      <div v-if="isHost" class="flex items-center gap-3 p-2 bg-white/40 backdrop-blur-md rounded-custom border border-primary/5 shadow-warm">
        <template v-if="table.status === 'PLANNING'">
          <ChefButton variant="primary" @click="advanceStatus" class="px-8 shadow-warm">
            开启投票
            <ArrowRightIcon :size="18" />
          </ChefButton>
        </template>
        <template v-if="table.status === 'VOTING'">
          <ChefButton variant="primary" @click="isVoterMatrixOpen = true" class="bg-white text-primary border-primary/20 hover:bg-primary/5 shadow-sm">
            <UsersIcon :size="18" />
            查看投票矩阵
          </ChefButton>
          <ChefButton variant="primary" @click="isConfirmingMenu = true" class="px-8 bg-success hover:bg-success/90 shadow-warm">
            确认并锁定菜单
            <LockIcon :size="18" />
          </ChefButton>
        </template>
        <template v-if="table.status === 'LOCKED'">
          <ChefButton variant="primary" @click="advanceStatus" class="px-8 shadow-warm">
            结束饭局
            <CheckCircleIcon :size="18" />
          </ChefButton>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Main Content: Dishes -->
      <div class="lg:col-span-8 space-y-8">
        <div class="chef-card p-8 bg-white/60 min-h-[500px] shadow-warm">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div class="space-y-1">
              <h2 class="serif-title text-2xl font-bold text-text-dark">候选菜谱</h2>
              <p class="text-xs text-text-muted">
                {{ table.status === 'PLANNING' ? '挑选您想为客人准备的精选佳肴' : '客人们正在表达他们的偏好' }}
              </p>
            </div>
            
            <!-- Category Tabs -->
            <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-full">
              <button 
                @click="activeTab = 'ALL'"
                :class="[
                  'px-4 py-2 rounded-custom text-xs font-bold whitespace-nowrap transition-all border',
                  activeTab === 'ALL' ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20' : 'bg-white/40 text-text-muted border-primary/10 hover:border-primary/30'
                ]"
              >
                全部
              </button>
              <button 
                v-for="(label, cat) in categoryLabels" 
                :key="cat"
                @click="activeTab = cat"
                :class="[
                  'px-4 py-2 rounded-custom text-xs font-bold whitespace-nowrap transition-all border',
                  activeTab === cat ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20' : 'bg-white/40 text-text-muted border-primary/10 hover:border-primary/30'
                ]"
              >
                {{ label }}
              </button>
            </div>

            <button 
              v-if="isHost && table.status === 'PLANNING'" 
              @click="isPickerOpen = true"
              class="flex items-center gap-2 text-primary font-bold text-sm hover:underline active:scale-95 transition-all"
            >
              <PlusCircleIcon :size="18" />
              挑选菜品
            </button>
          </div>

          <div v-if="table.candidateDishes.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
            <UtensilsCrossedIcon :size="64" />
            <p class="serif-title text-xl italic">暂无候选菜品</p>
          </div>

          <div v-else class="space-y-12">
            <div v-for="(dishes, cat) in groupedDishes" :key="cat">
              <!-- Show category section only if activeTab is 'ALL' or matches current cat -->
              <div v-if="(activeTab === 'ALL' || activeTab === cat) && (dishes?.length || 0) > 0" class="space-y-6">
                <div class="flex items-center gap-3">
                  <div class="h-px flex-1 bg-gradient-to-r from-transparent to-primary/10"></div>
                  <h3 class="text-xs font-bold text-primary uppercase tracking-[0.2em] px-4 py-1 bg-primary/5 rounded-full border border-primary/10">
                    {{ categoryLabels[cat] }}
                  </h3>
                  <div class="h-px flex-1 bg-gradient-to-l from-transparent to-primary/10"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    v-for="dish in dishes" 
                    :key="dish.id" 
                    class="chef-card group overflow-hidden bg-white/80 border-primary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 relative"
                  >
                    <!-- Rank Badge (Top 3 overall) -->
                    <div v-if="table.status !== 'PLANNING' && allTimeTopDishes.findIndex(d => d.id === dish.id) !== -1" class="absolute top-2 left-2 z-10">
                      <div class="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                        <TrophyIcon :size="10" />
                        TOP {{ allTimeTopDishes.findIndex(d => d.id === dish.id) + 1 }}
                      </div>
                    </div>

                    <div class="h-40 overflow-hidden relative">
                      <img :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div class="absolute inset-0 bg-gradient-to-t from-text-dark/60 via-transparent to-transparent"></div>
                      <div class="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <div class="space-y-0.5">
                          <span class="text-white font-bold serif-title text-lg drop-shadow-md block leading-tight">{{ dish.name }}</span>
                          <span v-if="table.status !== 'PLANNING'" class="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                            分类排名 #{{ getCategoryRank(dish.id, cat) }}
                          </span>
                        </div>
                        <span class="text-white/80 text-[10px] uppercase tracking-widest font-bold bg-black/20 backdrop-blur-md px-2 py-0.5 rounded shadow-sm border border-white/10">{{ categoryLabels[dish.category] }}</span>
                      </div>
                    </div>

                    <div class="p-4 space-y-4">
                      <div class="flex justify-between items-center">
                        <!-- Vote Button -->
                        <button 
                          v-if="table.status === 'VOTING'"
                          @click="toggleVote(dish.id)"
                          :disabled="votingDishId === dish.id"
                          :class="[
                            'flex items-center gap-2 px-5 py-2 rounded-custom text-xs font-bold transition-all duration-500 relative overflow-hidden group/btn',
                            hasVoted(dish.id) 
                              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                              : 'bg-accent/20 text-primary hover:bg-accent/40 active:scale-90',
                            votingDishId === dish.id ? 'opacity-70 cursor-not-allowed' : ''
                          ]"
                        >
                          <span v-if="votingDishId === dish.id" class="absolute inset-0 flex items-center justify-center bg-inherit">
                            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>

                          <template v-else>
                            <span v-if="hasVoted(dish.id)" class="absolute inset-0 bg-white/20 animate-ping rounded-full"></span>
                            <HeartIcon 
                              :size="14" 
                              :fill="hasVoted(dish.id) ? 'currentColor' : 'none'"
                              :class="[
                                'transition-transform duration-500',
                                hasVoted(dish.id) ? 'scale-125 animate-pulse' : 'group-hover/btn:scale-110'
                              ]"
                            />
                            <span class="relative z-10">{{ hasVoted(dish.id) ? '已想吃' : '我想吃' }}</span>
                          </template>
                        </button>

                        <!-- Heat Indicator & Voter Avatars -->
                        <div v-if="table.status !== 'PLANNING'" class="flex items-center gap-3">
                          <!-- Voter Avatars Stack (Visible for Host or when voted) -->
                          <div v-if="getVotersForDish(dish.id).length > 0" class="flex -space-x-2">
                            <div 
                              v-for="voter in getVotersForDish(dish.id).slice(0, 3)" 
                              :key="voter.id"
                              class="w-6 h-6 rounded-full border-2 border-white bg-accent/40 flex items-center justify-center text-[8px] font-bold text-primary shadow-sm"
                              :title="voter.name"
                            >
                              {{ voter.name[0] }}
                            </div>
                            <div v-if="getVotersForDish(dish.id).length > 3" class="w-6 h-6 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shadow-sm">
                              +{{ getVotersForDish(dish.id).length - 3 }}
                            </div>
                          </div>

                          <div class="flex items-center gap-1 text-primary">
                            <FlameIcon :size="14" :class="getVoteCount(dish.id) > 0 ? 'animate-bounce text-orange-500' : 'opacity-40'" />
                            <span class="text-xs font-bold">{{ getVoteCount(dish.id) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Popularity Bar -->
                      <div v-if="table.status !== 'PLANNING'" class="space-y-1.5">
                        <div class="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                          <div 
                            class="h-full bg-primary shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all duration-1000 ease-out" 
                            :style="{ width: `${getPopularityWidth(dish.id)}%` }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Side Panel: Info & Social -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Social/Invite Card -->
        <div class="chef-card p-6 bg-gradient-to-br from-primary to-text-muted text-white space-y-6 shadow-warm">
          <div class="space-y-2">
            <h3 class="serif-title text-xl font-bold">邀约好友</h3>
            <p class="text-white/70 text-xs">家宴的快乐源于分享。将饭桌链接发送给好友，共同拟定这份期待。</p>
          </div>
          <div class="bg-white/10 backdrop-blur-md p-3 rounded-custom border border-white/20 break-all text-[10px] font-mono select-all">
            {{ inviteUrl }}
          </div>
          <ChefButton @click="copyLink" class="w-full bg-white text-primary hover:bg-accent hover:text-text-dark border-none shadow-lg">
            <CopyIcon :size="18" />
            复制链接
          </ChefButton>
        </div>

        <!-- Billing Summary -->
        <div v-if="table.status === 'LOCKED' || table.status === 'ARCHIVED'" class="chef-card p-6 bg-white/80 space-y-6 shadow-warm">
          <div class="flex items-center gap-2 text-text-dark">
            <ReceiptIcon :size="20" />
            <h3 class="serif-title text-xl font-bold">收支概览</h3>
          </div>

          <div v-if="table.totalExpense" class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-text-muted">总支出</span>
              <span class="text-xl font-bold text-primary serif-title">¥ {{ table.totalExpense.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-text-muted">参与人数</span>
              <span class="font-bold text-text-dark">{{ table.guests.length }} 位</span>
            </div>
            <div class="pt-4 border-t border-primary/5 flex justify-between items-center">
              <span class="text-xs font-bold text-text-dark uppercase tracking-widest">人均 AA</span>
              <div class="text-right">
                <span class="text-3xl font-bold text-primary serif-title">¥ {{ (table.totalExpense / (table.guests.length || 1)).toFixed(2) }}</span>
                <p class="text-[10px] text-text-muted/40 mt-1 italic">自动计算，公开透明</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 space-y-4">
            <p class="text-sm text-text-muted/60 italic">主人尚未录入结算金额</p>
            <ChefButton v-if="isHost" variant="primary" class="w-full text-xs shadow-sm" @click="isBillingModalOpen = true">
              录入账单
            </ChefButton>
          </div>
        </div>

        <!-- Guests List -->
        <div class="chef-card p-6 bg-white/60 space-y-6 shadow-warm">
          <div class="flex items-center justify-between">
            <h3 class="serif-title text-xl font-bold text-text-dark">围炉好友</h3>
            <span class="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{{ table.guests.length }} 人</span>
          </div>
          <div class="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            <div v-for="guest in table.guests" :key="guest.id" class="flex items-center gap-4 group">
              <div class="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                {{ guest.name[0] }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-text-dark">{{ guest.name }}</p>
                <p v-if="guest.preferences" class="text-[10px] text-text-muted/60 italic truncate">{{ guest.preferences }}</p>
              </div>
              <div class="flex gap-1">
                <div v-for="v in guest.votes" :key="v.id" class="w-1 h-1 rounded-full bg-primary/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Join Table Modal -->
    <ChefModal v-model="isJoinModalOpen" title="加入围炉" :close-on-outside-click="false" :show-close="false">
      <div class="space-y-6">
        <p class="text-sm text-text-muted">欢迎来到主人的私人宴请，请告知您的称呼与用餐偏好。</p>
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest">您的昵称</label>
            <input 
              v-model="joinForm.name" 
              type="text" 
              placeholder="怎么称呼您？" 
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest">忌口/偏好 (可选)</label>
            <textarea 
              v-model="joinForm.preferences" 
              placeholder="如：不吃香菜、海鲜过敏..." 
              rows="2"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </div>
      <template #footer>
        <ChefButton variant="primary" @click="handleJoinTable" :disabled="!joinForm.name || isLoading" class="w-full shadow-warm">
          {{ isLoading ? '正在加入...' : '加入围炉' }}
        </ChefButton>
      </template>
    </ChefModal>

    <!-- Picker Modal -->
    <ChefModal v-model="isPickerOpen" title="挑选饭桌菜品">
      <div class="space-y-6">
        <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="activePickerCategory = cat"
            :class="[
              'px-4 py-2 rounded-custom text-xs font-bold whitespace-nowrap transition-all',
              activePickerCategory === cat ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'
            ]"
          >
            {{ cat }}
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div 
            v-for="dish in filteredAllDishes" 
            :key="dish.id"
            @click="toggleDishSelection(dish.id)"
            :class="[
              'p-3 rounded-custom border-2 transition-all cursor-pointer flex flex-col gap-2',
              isDishSelected(dish.id) ? 'border-primary bg-primary/5' : 'border-primary/5 bg-white hover:border-primary/20'
            ]"
          >
            <img :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'" class="w-full h-24 object-cover rounded-custom" />
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-text-dark truncate">{{ dish.name }}</span>
              <div v-if="isDishSelected(dish.id)" class="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <CheckIcon :size="10" class="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="isPickerOpen = false" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">取消</button>
        <ChefButton variant="primary" @click="saveSelectedDishes" :disabled="isLoading" class="shadow-warm">
          确认挑选 ({{ selectedDishIds.length }})
        </ChefButton>
      </template>
    </ChefModal>

    <!-- Billing Modal (Simple placeholder) -->
    <ChefModal v-model="isBillingModalOpen" title="录入饭单结算">
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">总支出金额 (元)</label>
          <input 
            v-model="billingAmount" 
            type="number" 
            step="0.01"
            placeholder="请输入本次聚餐的总花费" 
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all text-xl font-bold serif-title text-primary"
          />
        </div>
      </div>
      <template #footer>
        <button @click="isBillingModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">取消</button>
        <ChefButton variant="primary" @click="saveBilling" :disabled="isLoading" class="shadow-warm">确认结算</ChefButton>
      </template>
    </ChefModal>

    <!-- Voter Matrix Modal (Host Only) -->
    <ChefModal v-model="isVoterMatrixOpen" title="全景投票矩阵" class="max-w-4xl">
      <div class="space-y-6">
        <div class="overflow-x-auto custom-scrollbar -mx-6 px-6">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th class="p-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest bg-primary/5 rounded-tl-2xl sticky left-0 z-20 backdrop-blur-md border-b border-primary/10">
                  菜品 / 访客
                </th>
                <th v-for="guest in table.guests" :key="guest.id" class="p-4 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest bg-primary/5 border-b border-primary/10 min-w-[100px]">
                  {{ guest.name }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary/5">
              <tr v-for="dish in table.candidateDishes" :key="dish.id" class="group hover:bg-primary/5 transition-colors">
                <td class="p-4 text-sm font-bold text-text-dark sticky left-0 bg-white/95 backdrop-blur-sm z-10 border-r border-primary/5 group-last:rounded-bl-2xl">
                  {{ dish.name }}
                </td>
                <td v-for="guest in table.guests" :key="guest.id" class="p-4 text-center">
                  <div v-if="guest.votes.some(v => v.dishId === dish.id)" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary animate-pop shadow-sm border border-primary/10">
                    <CheckIcon :size="16" />
                  </div>
                  <div v-else class="text-text-muted/10 font-light">-</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-bg-warm rounded-custom border border-primary/10 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <UsersIcon :size="16" class="text-primary" />
            <h4 class="text-xs font-bold text-text-dark uppercase tracking-wider">访客偏好概览</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="guest in table.guests" :key="guest.id" class="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-primary/5 hover:border-primary/20 transition-all shadow-sm">
              <div class="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-primary font-bold text-sm border-2 border-white shadow-sm">{{ guest.name[0] }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-text-dark truncate">{{ guest.name }}</p>
                <p class="text-[10px] text-text-muted italic truncate">{{ guest.preferences || '无特殊偏好' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChefModal>

    <!-- Confirm Menu Modal (定稿模式) -->
    <ChefModal v-model="isConfirmingMenu" title="锁定最终菜单" class="max-w-2xl">
      <div class="space-y-6">
        <div class="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary">
              <TrendingUpIcon :size="18" />
              <h4 class="font-bold text-sm">定稿工作台</h4>
            </div>
            <span class="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-primary/10 text-primary">
              已选 {{ finalSelectionIds.length }} 道菜品
            </span>
          </div>
          <p class="text-xs text-text-muted leading-relaxed">
            请勾选最终上桌的菜品。系统已自动为您勾选了有投票的项，您可以根据访客偏好进行微调。
          </p>
        </div>

        <div class="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="(dishes, cat) in groupedDishes" :key="cat">
            <div v-if="(dishes?.length || 0) > 0" class="space-y-3">
              <h5 class="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                {{ categoryLabels[cat] }}
                <div class="h-px flex-1 bg-primary/5"></div>
              </h5>
              <div class="grid grid-cols-1 gap-2">
                <div 
                  v-for="dish in dishes" 
                  :key="dish.id"
                  @click="toggleFinalSelection(dish.id)"
                  class="flex items-center justify-between p-3 rounded-custom border transition-all cursor-pointer group"
                  :class="finalSelectionIds.includes(dish.id) ? 'bg-white border-primary shadow-md' : 'bg-white/40 border-primary/5 opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'"
                >
                  <div class="flex items-center gap-3">
                    <img :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" class="w-12 h-12 rounded-custom object-cover" />
                    <div>
                      <p class="text-sm font-bold" :class="finalSelectionIds.includes(dish.id) ? 'text-primary' : 'text-text-dark'">{{ dish.name }}</p>
                      <p class="text-[10px] text-text-muted">{{ getVoteCount(dish.id) }} 人投票 · 分类排名 #{{ getCategoryRank(dish.id, cat) }}</p>
                    </div>
                  </div>
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all" :class="finalSelectionIds.includes(dish.id) ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'border-primary/20 bg-white group-hover:border-primary/40'">
                    <CheckIcon v-if="finalSelectionIds.includes(dish.id)" :size="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="isConfirmingMenu = false" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">再想想</button>
        <ChefButton variant="primary" @click="handleLockMenu" :disabled="isLoading || finalSelectionIds.length === 0" class="bg-success hover:bg-success/90 min-w-[160px]">
          {{ isLoading ? '正在保存...' : '确认锁定并开启盛宴' }}
        </ChefButton>
      </template>
    </ChefModal>
  </div>
</template>

<script setup lang="ts">
// ... Logic remains largely the same, but imports and reactive refs are updated ...
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  CalendarIcon, MapPinIcon, UtensilsCrossedIcon, PlusCircleIcon, 
  ArrowRightIcon, LockIcon, CheckCircleIcon, HeartIcon, FlameIcon, 
  CopyIcon, ReceiptIcon, ArrowLeftIcon, CheckIcon,
  TrophyIcon, UsersIcon, TrendingUpIcon
} from 'lucide-vue-next';
import ChefButton from '../../components/ChefButton.vue';
import ChefModal from '../../components/ChefModal.vue';
import request from '../../api/request';
import type { Table, Dish } from '../../types';
import { TableStatus, Category } from '../../types';
import { useUserStore } from '../../stores/useUserStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const table = ref<Table | null>(null);
const allDishes = ref<Dish[]>([]);
const isHost = computed(() => table.value?.hostSessionId === userStore.sessionId);
const isGuest = computed(() => table.value?.guests.some(g => g.sessionId === userStore.sessionId));
const isJoinModalOpen = ref(false);
const isPickerOpen = ref(false);
const isBillingModalOpen = ref(false);
const isConfirmingMenu = ref(false);
const isVoterMatrixOpen = ref(false);
const isLoading = ref(false);
const votingDishId = ref<string | null>(null);

const joinForm = ref({
  name: userStore.guestName || '',
  preferences: ''
});

const selectedDishIds = ref<string[]>([]);
const finalSelectionIds = ref<string[]>([]);
const activePickerCategory = ref<'全部' | string>('全部');
const billingAmount = ref<number | null>(null);

const categories = ['全部', '热菜', '凉菜', '汤品', '主食', '饮料'];

const statusConfig: Record<TableStatus, { label: string; class: string }> = {
  [TableStatus.PLANNING]: { label: '筹备中', class: 'bg-accent/20 text-text-muted border-primary/20' },
  [TableStatus.VOTING]: { label: '投票中 🔥', class: 'bg-primary text-white border-transparent' },
  [TableStatus.LOCKED]: { label: '已锁定 🔒', class: 'bg-success/10 text-success border-success/30' },
  [TableStatus.ARCHIVED]: { label: '已结束 ✅', class: 'bg-gray-100 text-gray-500 border-gray-300 opacity-60' },
};

const categoryLabels: Record<Category, string> = {
  [Category.HOT_DISH]: '热菜',
  [Category.COLD_DISH]: '凉菜',
  [Category.SOUP]: '汤品',
  [Category.STAPLE]: '主食',
  [Category.DRINK]: '饮料',
};

const inviteUrl = computed(() => window.location.href);

const activeTab = ref<Category | 'ALL'>('ALL');

const groupedDishes = computed(() => {
  if (!table.value) return {};
  const groups: Partial<Record<Category, Dish[]>> = {};
  
  // 如果已锁定或已结束，只显示最终选定的菜品
  const dishesToShow = (table.value.status === TableStatus.LOCKED || table.value.status === TableStatus.ARCHIVED)
    ? table.value.candidateDishes.filter(d => table.value?.finalDishIds.includes(d.id))
    : table.value.candidateDishes;

  dishesToShow.forEach(dish => {
    if (!groups[dish.category]) groups[dish.category] = [];
    groups[dish.category]!.push(dish);
  });

  // 分类内按票数排序
  Object.keys(groups).forEach(cat => {
    groups[cat as Category]!.sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
  });

  return groups;
});

const allTimeTopDishes = computed(() => {
  if (!table.value) return [];
  return [...table.value.candidateDishes]
    .filter(d => getVoteCount(d.id) > 0)
    .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
    .slice(0, 3);
});

const getVotersForDish = (dishId: string) => {
  if (!table.value) return [];
  return table.value.guests.filter(g => 
    g.votes.some(v => v.dishId === dishId)
  );
};

const getCategoryRank = (dishId: string, category: Category) => {
  const dishesInCat = groupedDishes.value[category] || [];
  const index = dishesInCat.findIndex(d => d.id === dishId);
  return index > -1 ? index + 1 : null;
};

const fetchTable = async () => {
  try {
    const data: Table = await request.get(`/tables/${route.params.id}`);
    table.value = data;
    selectedDishIds.value = data.candidateDishes.map(d => d.id);
    
    // 初始化定稿选择：默认勾选所有有投票的菜品，或已经存在的 finalDishIds
    if (data.finalDishIds && data.finalDishIds.length > 0) {
      finalSelectionIds.value = [...data.finalDishIds];
    } else {
      finalSelectionIds.value = data.candidateDishes
        .filter(d => getVoteCount(d.id) > 0)
        .map(d => d.id);
    }

    if (data.totalExpense) billingAmount.value = data.totalExpense;

    // 如果不是主人，且还没加入，且饭桌未结束，弹出加入弹窗
    if (!isHost.value && !isGuest.value && table.value?.status !== TableStatus.ARCHIVED) {
      isJoinModalOpen.value = true;
    }
  } catch (err: any) {
    console.error('获取饭桌详情失败:', err);
    // 只有在初始加载失败时才弹窗，避免静默刷新干扰
    if (!table.value) {
      alert('加载饭桌详情失败，请检查网络连接或链接是否有效');
    }
  }
};

const handleJoinTable = async () => {
  if (!joinForm.value.name) return;
  isLoading.value = true;
  try {
    await request.post(`/tables/${route.params.id}/guests`, {
      sessionId: userStore.sessionId,
      name: joinForm.value.name,
      preferences: joinForm.value.preferences
    });
    userStore.setGuestName(joinForm.value.name);
    isJoinModalOpen.value = false;
    await fetchTable();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchAllDishes = async () => {
  try {
    allDishes.value = await request.get('/dishes');
  } catch (err) {
    console.error(err);
  }
};

const filteredAllDishes = computed(() => {
  if (activePickerCategory.value === '全部') return allDishes.value;
  return allDishes.value.filter(d => categoryLabels[d.category] === activePickerCategory.value);
});

const isDishSelected = (id: string) => selectedDishIds.value.includes(id);

const toggleDishSelection = (id: string) => {
  const index = selectedDishIds.value.indexOf(id);
  if (index > -1) {
    selectedDishIds.value.splice(index, 1);
  } else {
    selectedDishIds.value.push(id);
  }
};

const toggleFinalSelection = (id: string) => {
  const index = finalSelectionIds.value.indexOf(id);
  if (index > -1) {
    finalSelectionIds.value.splice(index, 1);
  } else {
    finalSelectionIds.value.push(id);
  }
};

const handleLockMenu = async () => {
  if (!table.value || isLoading.value) return;
  
  isLoading.value = true;
  try {
    // 1. 先保存最终选定的菜品 ID 列表
    await request.patch(`/tables/${table.value.id}/final-selection`, {
      dishIds: finalSelectionIds.value,
      sessionId: userStore.sessionId
    });

    // 2. 然后推进状态至 LOCKED
    await request.patch(`/tables/${table.value.id}/status`, { 
      status: TableStatus.LOCKED,
      sessionId: userStore.sessionId
    });

    isConfirmingMenu.value = false;
    await fetchTable();
  } catch (err: any) {
    console.error('定稿失败:', err);
    alert('定稿失败：' + (err.response?.data?.message || err.message));
  } finally {
    isLoading.value = false;
  }
};

const saveSelectedDishes = async () => {
  if (!table.value) return;
  isLoading.value = true;
  try {
    await request.patch(`/tables/${table.value.id}/candidates`, { 
      dishIds: selectedDishIds.value,
      sessionId: userStore.sessionId
    });
    isPickerOpen.value = false;
    fetchTable();
  } catch (err: any) {
    console.error(err);
    alert('保存失败：' + (err.response?.data?.message || err.message));
  } finally {
    isLoading.value = false;
  }
};

const saveBilling = async () => {
  if (!table.value || billingAmount.value === null) return;
  isLoading.value = true;
  try {
    await request.patch(`/tables/${table.value.id}/billing`, { 
      totalExpense: billingAmount.value,
      sessionId: userStore.sessionId 
    });
    isBillingModalOpen.value = false;
    fetchTable();
  } catch (err: any) {
    console.error(err);
    alert('结算失败：' + (err.response?.data?.message || err.message));
  } finally {
    isLoading.value = false;
  }
};

const advanceStatus = async () => {
  if (!table.value || isLoading.value) return;

  // 如果是投票中，点击进入定稿确认模式
  if (table.value.status === TableStatus.VOTING && !isConfirmingMenu.value) {
    isConfirmingMenu.value = true;
    return;
  }

  const nextStatusMap: Record<TableStatus, TableStatus> = {
    [TableStatus.PLANNING]: TableStatus.VOTING,
    [TableStatus.VOTING]: TableStatus.LOCKED,
    [TableStatus.LOCKED]: TableStatus.ARCHIVED,
    [TableStatus.ARCHIVED]: TableStatus.ARCHIVED,
  };
  
  isLoading.value = true;
  try {
    await request.patch(`/tables/${table.value.id}/status`, { 
      status: nextStatusMap[table.value.status],
      sessionId: userStore.sessionId
    });
    isConfirmingMenu.value = false;
    await fetchTable();
  } catch (err: any) {
    console.error('状态更新失败:', err);
    alert('操作失败：' + (err.response?.data?.message || err.message));
  } finally {
    isLoading.value = false;
  }
};

const toggleVote = async (dishId: string) => {
  if (!table.value || votingDishId.value) return;
  
  votingDishId.value = dishId;
  try {
    if (hasVoted(dishId)) {
      await request.delete(`/tables/${table.value.id}/votes/${dishId}`, { 
        data: { sessionId: userStore.sessionId } 
      });
    } else {
      await request.post(`/tables/${table.value.id}/votes`, { 
        sessionId: userStore.sessionId, 
        dishId 
      });
    }
    await fetchTable();
  } catch (err: any) {
    console.error('投票操作失败:', err);
    const errorMsg = err.response?.data?.message || err.message || '网络请求失败';
    alert(`操作失败: ${errorMsg}`);
  } finally {
    votingDishId.value = null;
  }
};

const hasVoted = (dishId: string) => {
  const myGuest = table.value?.guests.find(g => g.sessionId === userStore.sessionId);
  return myGuest?.votes.some(v => v.dishId === dishId);
};

const getVoteCount = (dishId: string) => {
  return table.value?.guests.reduce((acc, g) => acc + g.votes.filter(v => v.dishId === dishId).length, 0) || 0;
};

const getPopularityWidth = (dishId: string) => {
  const count = getVoteCount(dishId);
  if (count === 0) return 0;
  const maxVotes = Math.max(...(table.value?.candidateDishes.map(d => getVoteCount(d.id)) || [1]));
  return (count / maxVotes) * 100;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const copyLink = () => {
  navigator.clipboard.writeText(inviteUrl.value);
  alert('邀约链接已复制，去发送给好友吧！');
};

onMounted(() => {
  fetchTable();
  fetchAllDishes();
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse-slow {
  animation: pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.1);
  border-radius: 10px;
}
</style>
