  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
