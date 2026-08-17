import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Heart, Sparkles, Gift, Users, Settings } from 'lucide-react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart className="mr-2 h-4 w-4" />{t('wishlist')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/referral')}><Users className="mr-2 h-4 w-4" />{t('refer_friend_short')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/gift-cards')}><Gift className="mr-2 h-4 w-4" />{t('gift_cards')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" />{t('settings')}</DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />