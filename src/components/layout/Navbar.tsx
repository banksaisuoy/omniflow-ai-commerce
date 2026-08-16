import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Heart, Sparkles, Gift, Users, Settings } from 'lucide-react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" />{t('profile_settings')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/loyalty')}><Sparkles className="mr-2 h-4 w-4" />{t('rewards')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart className="mr-2 h-4 w-4" />{t('wishlist')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/referral')}><Users className="mr-2 h-4 w-4" />{t('refer_friend_short')}</DropdownMenuItem>