                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />{t('profile_settings')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/loyalty')}><Sparkles className="mr-2 h-4 w-4" />{t('rewards')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart className="mr-2 h-4 w-4" />{t('wishlist')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/referral')}><Users className="mr-2 h-4 w-4" />{t('refer_friend_short')}</DropdownMenuItem>