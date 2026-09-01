
  const createMut = useMutation({
    mutationFn: async () => {
      try {
        couponSchema.parse(form);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          throw new Error(err.errors[0].message);
        }
        throw err;
      }
      let tiers: any = null;
      if (form.tier_thresholds?.trim()) {