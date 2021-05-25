import React, { useState, useEffect } from 'react';

export default function() {

  const [projBdList, setProjBdList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const params = {
        page_index: 3,
        page_size: 8,
      }
      const req = await api.getProjBDList(params);
      setProjBdList(req.data.data);
    }
    fetchData();
  }, []);

  return <h1>Project BD</h1>;
}
