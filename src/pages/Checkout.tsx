        _coupon_code: formData.couponCode?.trim() || null,
      });
      if (error) throw error;
      const order = data as unknown as { id: string };

      clearCart();
      toast.success('สร้างคำสั่งซื้อสำเร็จ');
      navigate('/order-success', { state: { orderId: order?.id } });
    } catch (error: unknown) {
      toast.error((error as Error).message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }