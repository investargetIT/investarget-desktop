import React from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';

function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
  const [fetching, setFetching] = React.useState(false);
  const [fetchingMore, setFetchingMore] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const fetchRef = React.useRef(0);
  const dropdownContent = React.useRef(null);

  React.useEffect(() => {
    fetchOptions({ page_index: 1, page_size: 10 }).then(data => {
      const { list: newOptions, total } = data;
      setTotal(total);
      setOptions(newOptions);
    });
  }, []);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setSearch(value);
      setOptions([]);
      setFetching(true);
      setTotal(0);
      setPage(1);
      fetchOptions({ search: value, page_index: page, page_size: 10 }).then(data => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        const { list: newOptions, total } = data;
        setTotal(total);
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const loadMoreData = () => {
    setPage(page + 1);
    const params = { search, page_index: page + 1, page_size: 10 };
    setFetchingMore(true);
    fetchOptions(params)
      .then(data => {
        const { total, list } = data;
        setTotal(total);
        setOptions([...options, ...list]);
        setFetchingMore(false);
      })
      .catch(error => {
        setFetchingMore(false);
        props.dispatch({
          type: 'app/findError',
          payload: error,
        });
      });
  }

  const handleScroll = () => {
    const el = dropdownContent.current.querySelector('.rc-virtual-list-holder');
    const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (distance < 10 && options.length < total && !fetchingMore) {
      loadMoreData();
    }
  }

  const dropdownRender = originalNode => {
    return (
      <div ref={dropdownContent} onScroll={handleScroll}>
        {originalNode}
        {fetchingMore && <Spin style={{ paddingLeft: 14 }} size="small" />}
      </div>
    );
  }

  return (
    <Select
      size="large"
      showSearch
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
      dropdownRender={dropdownRender}
    />
  );
}

export default DebounceSelect;
