<template>
  <div style="margin-left: 10px">

    <div style="margin-bottom: 10px;margin-top: 20px">
      <el-input v-model="searchTokenID"
                placeholder="请输入TokenID"
                style="width: 200px"
                suffix-icon="el-icon-search"/>
      <el-select v-model="tokenStatue" clearable placeholder="请选择" style="margin-left:10px;width: 100px">
        <el-option
            v-for="item in tokenStatueType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
        </el-option>
      </el-select>
      <el-button type="primary" style="margin-left: 10px" >查询</el-button>
      <el-button type="success" @click="restParam">重置</el-button>
      <el-button type="warning" @click="createTokenInfo">创建Token</el-button>
    </div>

    <el-table :data="tokenList"
              :header-cell-style="{background: '#aeb7c5',color: '#2f2626'}"
              border
              style="overflow: auto;height: 500px;margin-bottom: 10px"
    >
      <el-table-column prop="tokenID" label="TokenID">
      </el-table-column>
      <el-table-column prop="tokenName" label="TokenName" >
      </el-table-column>
      <el-table-column prop="isListed" label="Statue">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="!scope.row.isListed">上架</el-tag>
          <el-tag type="success" v-if="scope.row.isListed">未上架</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tokenPrice" label="TokenPrice">
      </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template slot-scope="scope">
          <el-button type="success" size="small" @click="offShelf" style="margin-right: 10px">下架</el-button>
          <el-button type="primary" size="small" @click="openTokenInfo(scope.row)" style="margin-right: 10px">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer
        title="Token信息详情"
        :visible.sync="tokenInfoDrawer"
        :direction="direction"
    >
      <el-image :src="this.tokenInfo.tokenImage">
      </el-image>
      <el-descriptions style="margin: 10px" :column="1" border>
        <el-descriptions-item>
          <template slot="label">
            TokenID
          </template>
          {{this.tokenInfo.tokenID}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Name
          </template>
          {{this.tokenInfo.tokenName}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Statue
          </template>
            <el-tag type="danger" v-if="this.tokenList.isListed">上架</el-tag>
            <el-tag type="success" v-if="!this.tokenList.isListed">未上架</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Price
          </template>
          {{ this.tokenInfo.tokenPrice }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Describe
          </template>
          {{ this.tokenInfo.tokenDesc }}
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-left: 10px;margin-bottom: 10px">
        <el-button type="success" @click="toMarket()">上架交易市场</el-button>
        <el-button type="warning" @click="toAuction()">上架拍卖市场</el-button>
      </div>
    </el-drawer>

    <el-dialog title="创建Token"
               :visible.sync="createTokenDialog"
               width="30%"
               center>
      <el-form ref="form" :model="tokenForm">

        <el-form-item label="Token Picture">
          <el-upload
              action="http://localhost:3000/uploadImage"
              :on-success="handleSuccess"
              :before-upload="handleBefore"
              :file-list="this.fileList"
              list-type="picture">
            <el-tooltip content="只上传JPG/PNG/JPEG文件且不超过20MB" placement="top" effect="dark">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-tooltip>
          </el-upload>
        </el-form-item>

        <el-form-item label="Token Name" prop="tokenName">
          <el-input v-model="tokenForm.tokenName"></el-input>
        </el-form-item>
        <el-form-item label="Token Price" prop="tokenPrice">
          <el-input v-model="tokenForm.tokenPrice"></el-input>
        </el-form-item>
        <el-form-item label="Token Describe" prop="tokenDesc">
          <el-input v-model="tokenForm.tokenDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createToken">确定</el-button>
        <el-button @click="closeCreate">取消</el-button>
     </span>
    </el-dialog>

  </div>
</template>

<script>
import {addNFTtoAuction, addNFTtoMarket, myNFTs, safeMint,} from '@/utils/goods_util'
export default {
  name: "GoodsPage",
  data() {
    return {
      tokenList:[],
      tokenInfo:{
        tokenImage:"",
        tokenID: '',
        isListed: '',
        tokenName: '',
        tokenPrice:"",
        tokenDesc:""
      },
      fileList: [],
      tokenForm:{
        tokenImage:"",
        tokenName: '',
        tokenPrice:'',
        tokenDesc:''
      },
      pageSize:10,
      pageNum:1,
      total:0,
      searchTokenID:"",
      tokenInfoDrawer:false,
      createTokenDialog:false,
      direction:'rtl',
      tokenStatue:"",
      account:"",
      tokenStatueType:[{
        value: '未上架',
        label: '未上架'
      }, {
        value: '拍卖中',
        label: '拍卖中'
      },{
        value: '售卖中',
        label: '售卖中'
      }],
    }
  },
  methods:{
    offShelf(){
      this.$confirm('确定下架该Token吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '下架Token成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消下架'
        });
      });
    },
    toMarket(){
      this.$confirm('确定上架该Token到交易市场吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await addNFTtoMarket(this.account, this.tokenInfo.tokenID, this.tokenInfo.tokenPrice)
        this.tokenInfoDrawer=false
        this.getMyNFTs()
        this.$message({
          type: 'success',
          message: '上架Token到交易市场成功!'
        });
      })
    },
    toAuction(){
      this.$confirm('确定上架该Token到拍卖市场吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await addNFTtoAuction(this.account, this.tokenInfo.tokenID, this.tokenInfo.tokenPrice)
        this.tokenInfoDrawer = false
        this.getMyNFTs()
        this.$message({
          type: 'success',
          message: '上架Token到拍卖市场成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消上架'
        });
      });
    },

    createTokenInfo(){
      this.createTokenDialog=true
    },

    //创建NFT
    async createToken(){
      try {
        this.$axios.post("http://localhost:3000/upload",this.tokenForm).then(async (res) => {
          console.log(res.data)
          const tokenCid = res.data.tokenCid
          await safeMint(this.account,tokenCid)
          this.$notify({
            title: '创建NFT',
            message: '成功创建NFT' + this.tokenForm.tokenName,
            type: 'success'
          });
          this.closeCreate()
          this.getMyNFTs()
        })
      }catch (e){
        this.$notify({
          title: '创建NFT',
          message: '创建NFT失败'+e,
          type: 'error'
        });
      }

    },

    //查询自己所有的NFT
    getMyNFTs(){
      this.tokenList=[]
      myNFTs(this.account).then((res)=>{
        if (res!==null){
          let tokenIndexList=res.tokenIndexList
          let isListed=res.isListedList
          for(let i=0; i<tokenIndexList.length; i++){
            console.log(res)
            this.$axios.get(res.tokenList[i]).then((res)=>{
              res.data.tokenID=tokenIndexList[i]
              res.data.isListed=isListed[i]
              this.tokenList.push(res.data)
              console.log(this.tokenList)
            })
          }
        }
      })
    },

    closeCreate(){
      this.createTokenDialog=false
    },
    openTokenInfo(tokenInfo){
      this.tokenInfo.isListed=tokenInfo.isListed
      this.tokenInfo.tokenID=tokenInfo.tokenID
      this.tokenInfo.tokenImage=tokenInfo.tokenImage
      this.tokenInfo.tokenName=tokenInfo.tokenName
      this.tokenInfo.tokenPrice=tokenInfo.tokenPrice
      this.tokenInfo.tokenDesc=tokenInfo.tokenDesc
      this.tokenInfoDrawer=true
    },

    handleBefore(file) {
      const isLt20M = file.size / 1024 / 1024 /1024 < 2;
      if (file.type!=='image/png' && file.type!=='image/jpg' && file.type!=='image/jpeg') {
        this.$message.error('上传的照片只能是 PNG、JPG、JPEG格式!');
        return false
      }
      if (!isLt20M) {
        this.$message.error('上传的照片大小不能超过 20MB!');
        return false
      }
      return true;
    },
    handleSuccess(res){
      console.log(res)
      this.tokenForm.tokenImage=res.tokenImage
    },
    restParam(){
      this.findMaterial=''
      this.findClassification=''
    },

  },
  created() {
    this.account=localStorage.getItem("account")
    this.getMyNFTs()
  }

}
</script>

<style>
.demo-table-expand label {
  width: 150px;
  color: #6293e5;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>