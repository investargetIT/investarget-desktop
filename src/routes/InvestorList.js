import React from 'react';
import styles from './InvestorList.css';
import InvestorListComponent from '../components/InvestorList/InvestorList';
import MainLayout from '../components/MainLayout/MainLayout';

function InvestorList() {
  return (
    <MainLayout location={location}>
      <div className={styles.normal}>
        <InvestorListComponent />
      </div>
    </MainLayout>
  );
}



export default InvestorList;
